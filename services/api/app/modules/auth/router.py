"""HTTP surface for auth. Routing and validation only.

Business logic belongs in service.py; this file translates HTTP to it.

Sign-in itself happens in Firebase (phone OTP on mobile, email or provider on
web). These endpoints turn a Firebase ID token into a JanMaang account and
back out again.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    AccountDisabledError,
    AuthUnavailableError,
    Principal,
    TokenVerifier,
    VerifiedToken,
    get_current_principal,
    get_token_verifier,
    get_verified_token,
)
from app.modules.audit import service as audit
from app.modules.users import service as users
from app.modules.users.schemas import UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        200: {"description": "Already registered; the existing account", "model": UserRead},
        401: {"description": "Missing, invalid, expired or revoked Firebase token"},
        403: {"description": "The account exists but is disabled"},
    },
)
async def register(
    response: Response,
    token: VerifiedToken = Depends(get_verified_token),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Create the caller's citizen account. Idempotent: safe to call on every sign-in."""
    try:
        account, created = await users.register_citizen(db, token)
    except AccountDisabledError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled") from None
    if not created:
        response.status_code = status.HTTP_200_OK
    return account


@router.get(
    "/me",
    response_model=UserRead,
    responses={
        401: {"description": "Missing, invalid, expired or revoked Firebase token"},
        403: {"description": "Not registered, or disabled"},
    },
)
async def me(
    principal: Principal = Depends(get_current_principal),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """The caller's own account, including the role and scope the API will enforce."""
    return await users.get_profile(db, principal.user_id)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={503: {"description": "Firebase could not be reached; nothing was revoked"}},
)
async def logout(
    principal: Principal = Depends(get_current_principal),
    verifier: TokenVerifier = Depends(get_token_verifier),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Sign out on every device: revoke the caller's Firebase refresh tokens.

    Tokens already issued are refused from the next request on, because every
    verification checks for revocation.
    """
    try:
        await verifier.revoke(principal.firebase_uid)
    except AuthUnavailableError:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Sign-out could not be completed"
        ) from None
    await audit.record(
        db,
        actor_id=principal.user_id,
        action="auth.signed_out_everywhere",
        entity_type="user",
        entity_id=str(principal.user_id),
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
