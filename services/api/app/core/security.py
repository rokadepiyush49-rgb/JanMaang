"""Authentication: Firebase ID token in, local Principal out.

Firebase Auth stays the identity provider — phone OTP for rural citizens is
genuinely hard to replace and carries no demo value. Everything downstream of
this module deals only in `Principal`, so swapping the provider later touches
one file.

Two steps, two seams (ADR 0006):

1. **Verify** the bearer token — signature, audience, expiry, revocation.
   Done by a `TokenVerifier` (Firebase in production, a fake in tests).
2. **Resolve** the verified identity to a local user with a role and scope.
   Done by a `PrincipalResolver` that lives in the users module.

`core` may not import `modules` (import-linter), so both are attached to
`app.state` by `create_app()` and read here per request. If either is missing
the request fails closed with 503 — never open.
"""

from collections.abc import Awaitable, Callable, Mapping
from dataclasses import dataclass, field
from typing import Any, Protocol
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.roles import Role

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True, slots=True)
class Principal:
    """The authenticated caller. Never a Firebase object — always ours."""

    user_id: UUID
    firebase_uid: str
    role: Role
    district_id: UUID | None = None
    gram_panchayat_id: UUID | None = None
    department_id: UUID | None = None
    institute_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class VerifiedToken:
    """What a verified Firebase ID token tells us. Identity only — no role."""

    uid: str
    email: str | None = None
    phone_number: str | None = None
    name: str | None = None
    claims: Mapping[str, Any] = field(default_factory=dict)


class InvalidTokenError(Exception):
    """The token is malformed, expired, revoked, for another project, or forged."""


class AuthUnavailableError(Exception):
    """The verifier could not reach the identity provider. Not the caller's fault."""


class AccountDisabledError(Exception):
    """The account exists but has been deactivated."""


class TokenVerifier(Protocol):
    async def verify(self, token: str) -> VerifiedToken: ...

    async def revoke(self, uid: str) -> None: ...


PrincipalResolver = Callable[[AsyncSession, VerifiedToken], Awaitable[Principal | None]]


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_token_verifier(request: Request) -> TokenVerifier:
    verifier: TokenVerifier | None = getattr(request.app.state, "token_verifier", None)
    if verifier is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )
    return verifier


async def get_verified_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    verifier: TokenVerifier = Depends(get_token_verifier),
) -> VerifiedToken:
    """A valid Firebase identity, whether or not it has a JanMaang account yet.

    Only the registration endpoint stops here; everything else needs a
    Principal. The reason a token failed is logged by the verifier, never
    returned — "expired" vs "forged" is a hint an attacker should not get.
    """
    if credentials is None or not credentials.credentials:
        raise _unauthorized("Not authenticated")
    try:
        return await verifier.verify(credentials.credentials)
    except InvalidTokenError:
        raise _unauthorized("Invalid or expired token") from None
    except AuthUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is temporarily unavailable",
        ) from None


async def get_current_principal(
    request: Request,
    token: VerifiedToken = Depends(get_verified_token),
    db: AsyncSession = Depends(get_db),
) -> Principal:
    """Resolve the verified identity to a local user with a role and scope."""
    resolver: PrincipalResolver | None = getattr(request.app.state, "principal_resolver", None)
    if resolver is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )
    try:
        principal = await resolver(db, token)
    except AccountDisabledError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled"
        ) from None
    if principal is None:
        # Signed in with Firebase but never registered: a different problem
        # from a bad token, so 403 rather than 401.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No JanMaang account for this sign-in. Register first.",
        )
    return principal
