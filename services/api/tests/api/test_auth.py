"""Authentication: every way a request can fail to become a Principal.

The Firebase verifier and the database-backed resolver are swapped for fakes
through the same app.state seams production uses, so these run anywhere.
tests/integration/ covers the real resolver against PostgreSQL.
"""

import uuid
from collections.abc import AsyncIterator, Iterator
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient
from firebase_admin import auth as firebase_auth

from app.core.config import get_settings
from app.core.database import get_db
from app.core.firebase_auth import FirebaseTokenVerifier
from app.core.roles import Role
from app.core.security import (
    AccountDisabledError,
    AuthUnavailableError,
    InvalidTokenError,
    Principal,
    VerifiedToken,
    get_current_principal,
)
from app.main import create_app
from app.modules.users import repository as users_repository
from app.modules.users import service as users_service
from app.modules.users.schemas import UserRead

ALICE_ID = uuid.uuid4()
ALICE = VerifiedToken(uid="fb-alice", email="alice@example.org", name="Alice")
# A token whose custom claims say super_admin. Roles come from the database,
# so this must still resolve to whatever the users table says.
MALLORY = VerifiedToken(uid="fb-mallory", claims={"role": "super_admin", "officer": True})


class FakeVerifier:
    def __init__(self) -> None:
        self.tokens: dict[str, VerifiedToken] = {"good": ALICE, "mallory": MALLORY}
        self.unavailable = False
        self.revoked: list[str] = []

    async def verify(self, token: str) -> VerifiedToken:
        if self.unavailable:
            raise AuthUnavailableError("CertificateFetchError")
        if token not in self.tokens:
            raise InvalidTokenError("ExpiredIdTokenError")
        return self.tokens[token]

    async def revoke(self, uid: str) -> None:
        if self.unavailable:
            raise AuthUnavailableError("down")
        self.revoked.append(uid)


def _principal(role: Role = Role.CITIZEN) -> Principal:
    return Principal(user_id=ALICE_ID, firebase_uid=ALICE.uid, role=role)


@pytest.fixture
def harness() -> Iterator[SimpleNamespace]:
    get_settings.cache_clear()
    app = create_app()
    verifier = FakeVerifier()
    outcomes: dict[str, Principal | Exception | None] = {ALICE.uid: _principal()}

    async def resolver(_db: object, token: VerifiedToken) -> Principal | None:
        outcome = outcomes.get(token.uid)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    async def no_db() -> AsyncIterator[None]:
        yield None

    app.state.token_verifier = verifier
    app.state.principal_resolver = resolver
    app.dependency_overrides[get_db] = no_db

    @app.get("/api/v1/_probe/whoami")
    async def whoami(principal: Principal = Depends(get_current_principal)) -> dict[str, str]:
        return {"role": principal.role.value, "user_id": str(principal.user_id)}

    yield SimpleNamespace(
        client=TestClient(app, raise_server_exceptions=False),
        verifier=verifier,
        outcomes=outcomes,
    )
    get_settings.cache_clear()


def _whoami(harness: SimpleNamespace, token: str | None) -> Any:
    headers = {"authorization": f"Bearer {token}"} if token else {}
    return harness.client.get("/api/v1/_probe/whoami", headers=headers)


def test_no_token_is_401_with_a_bearer_challenge(harness: SimpleNamespace) -> None:
    response = _whoami(harness, None)
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_bad_token_is_401_and_does_not_say_why(harness: SimpleNamespace) -> None:
    response = _whoami(harness, "forged.or.expired")
    assert response.status_code == 401
    assert "Expired" not in response.text


def test_provider_outage_is_503_not_401(harness: SimpleNamespace) -> None:
    harness.verifier.unavailable = True
    assert _whoami(harness, "good").status_code == 503


def test_verified_but_unregistered_is_403(harness: SimpleNamespace) -> None:
    harness.outcomes.pop(ALICE.uid)
    response = _whoami(harness, "good")
    assert response.status_code == 403
    assert "Register" in response.text


def test_disabled_account_is_403(harness: SimpleNamespace) -> None:
    harness.outcomes[ALICE.uid] = AccountDisabledError()
    assert _whoami(harness, "good").status_code == 403


def test_valid_token_resolves_to_the_database_role(harness: SimpleNamespace) -> None:
    response = _whoami(harness, "good")
    assert response.status_code == 200
    assert response.json() == {"role": "citizen", "user_id": str(ALICE_ID)}


def test_missing_resolver_fails_closed(harness: SimpleNamespace) -> None:
    del harness.client.app.state.principal_resolver
    assert _whoami(harness, "good").status_code == 503


# ─── /auth endpoints ─────────────────────────────────────────────────────────


def _account(role: Role = Role.CITIZEN) -> UserRead:
    return UserRead(
        id=ALICE_ID,
        role=role,
        display_name="Alice",
        email="alice@example.org",
        phone_number=None,
        district_id=None,
        gram_panchayat_id=None,
        department_id=None,
        institute_id=None,
        is_active=True,
        created_at=datetime.now(UTC),
    )


def test_register_is_201_then_200(
    harness: SimpleNamespace, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls = {"n": 0}

    async def register_citizen(_db: object, token: VerifiedToken) -> tuple[UserRead, bool]:
        assert token.uid == ALICE.uid
        calls["n"] += 1
        return _account(), calls["n"] == 1

    monkeypatch.setattr(users_service, "register_citizen", register_citizen)
    headers = {"authorization": "Bearer good"}
    assert harness.client.post("/api/v1/auth/register", headers=headers).status_code == 201
    second = harness.client.post("/api/v1/auth/register", headers=headers)
    assert second.status_code == 200
    assert second.json()["role"] == "citizen"


def test_register_needs_a_valid_token(harness: SimpleNamespace) -> None:
    response = harness.client.post("/api/v1/auth/register", headers={"authorization": "Bearer x"})
    assert response.status_code == 401


def test_register_refuses_a_disabled_account(
    harness: SimpleNamespace, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def register_citizen(_db: object, _token: VerifiedToken) -> tuple[UserRead, bool]:
        raise AccountDisabledError

    monkeypatch.setattr(users_service, "register_citizen", register_citizen)
    response = harness.client.post(
        "/api/v1/auth/register", headers={"authorization": "Bearer good"}
    )
    assert response.status_code == 403


def test_me_returns_the_callers_own_account(
    harness: SimpleNamespace, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def get_profile(_db: object, user_id: uuid.UUID) -> UserRead:
        assert user_id == ALICE_ID
        return _account()

    monkeypatch.setattr(users_service, "get_profile", get_profile)
    response = harness.client.get("/api/v1/auth/me", headers={"authorization": "Bearer good"})
    assert response.status_code == 200
    assert response.json()["id"] == str(ALICE_ID)


def test_logout_revokes_the_callers_tokens_and_audits(
    harness: SimpleNamespace, monkeypatch: pytest.MonkeyPatch
) -> None:
    recorded: list[dict[str, Any]] = []

    async def record(_db: object, **event: Any) -> None:
        recorded.append(event)

    monkeypatch.setattr("app.modules.audit.service.record", record)
    response = harness.client.post("/api/v1/auth/logout", headers={"authorization": "Bearer good"})
    assert response.status_code == 204
    assert harness.verifier.revoked == [ALICE.uid]
    assert recorded[0]["action"] == "auth.signed_out_everywhere"
    assert recorded[0]["actor_id"] == ALICE_ID


def test_logout_reports_failure_and_records_nothing_when_firebase_is_down(
    harness: SimpleNamespace, monkeypatch: pytest.MonkeyPatch
) -> None:
    recorded: list[object] = []

    async def record(_db: object, **event: Any) -> None:
        recorded.append(event)

    monkeypatch.setattr("app.modules.audit.service.record", record)
    # Verify succeeds (cached keys), revoke cannot reach Firebase.
    verifier = harness.verifier

    async def revoke(_uid: str) -> None:
        raise AuthUnavailableError("down")

    monkeypatch.setattr(verifier, "revoke", revoke)
    response = harness.client.post("/api/v1/auth/logout", headers={"authorization": "Bearer good"})
    assert response.status_code == 503
    assert recorded == []


# ─── the resolver: roles come from the database, never the token ─────────────


async def test_resolver_ignores_role_claims_in_the_token(monkeypatch: pytest.MonkeyPatch) -> None:
    row = SimpleNamespace(
        id=uuid.uuid4(),
        firebase_uid=MALLORY.uid,
        role=Role.CITIZEN,
        is_active=True,
        district_id=None,
        gram_panchayat_id=None,
        department_id=None,
        institute_id=None,
    )

    async def get_by_firebase_uid(_db: object, uid: str) -> object:
        return row if uid == MALLORY.uid else None

    monkeypatch.setattr(users_repository, "get_by_firebase_uid", get_by_firebase_uid)
    principal = await users_service.resolve_principal(None, MALLORY)  # type: ignore[arg-type]
    assert principal is not None
    assert principal.role is Role.CITIZEN


async def test_resolver_refuses_inactive_and_unknown_accounts(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    inactive = SimpleNamespace(is_active=False)

    async def get_by_firebase_uid(_db: object, uid: str) -> object:
        return inactive if uid == ALICE.uid else None

    monkeypatch.setattr(users_repository, "get_by_firebase_uid", get_by_firebase_uid)
    with pytest.raises(AccountDisabledError):
        await users_service.resolve_principal(None, ALICE)  # type: ignore[arg-type]
    assert await users_service.resolve_principal(None, MALLORY) is None  # type: ignore[arg-type]


# ─── the Firebase verifier's error mapping ──────────────────────────────────


@pytest.fixture
def firebase_verifier(monkeypatch: pytest.MonkeyPatch) -> FirebaseTokenVerifier:
    verifier = FirebaseTokenVerifier(get_settings())
    monkeypatch.setattr(verifier, "_get_app", lambda: object())
    return verifier


@pytest.mark.parametrize(
    "error",
    [
        firebase_auth.ExpiredIdTokenError("expired", cause=None),
        firebase_auth.RevokedIdTokenError("revoked"),
        firebase_auth.InvalidIdTokenError("wrong audience"),
        firebase_auth.UserDisabledError("disabled"),
        ValueError("not a JWT"),
    ],
    ids=["expired", "revoked", "invalid", "disabled", "malformed"],
)
async def test_firebase_rejections_become_invalid_token(
    firebase_verifier: FirebaseTokenVerifier, monkeypatch: pytest.MonkeyPatch, error: Exception
) -> None:
    def verify_id_token(*_args: object, **_kwargs: object) -> dict[str, Any]:
        raise error

    monkeypatch.setattr(firebase_auth, "verify_id_token", verify_id_token)
    with pytest.raises(InvalidTokenError):
        await firebase_verifier.verify("token")


async def test_certificate_fetch_failure_is_unavailable_not_invalid(
    firebase_verifier: FirebaseTokenVerifier, monkeypatch: pytest.MonkeyPatch
) -> None:
    def verify_id_token(*_args: object, **_kwargs: object) -> dict[str, Any]:
        raise firebase_auth.CertificateFetchError("no keys", cause=None)

    monkeypatch.setattr(firebase_auth, "verify_id_token", verify_id_token)
    with pytest.raises(AuthUnavailableError):
        await firebase_verifier.verify("token")


async def test_verifier_checks_revocation_and_maps_claims(
    firebase_verifier: FirebaseTokenVerifier, monkeypatch: pytest.MonkeyPatch
) -> None:
    seen: dict[str, object] = {}

    def verify_id_token(token: str, **kwargs: object) -> dict[str, Any]:
        seen.update(kwargs)
        return {"uid": "fb-1", "phone_number": "+910000000000", "name": "R"}

    monkeypatch.setattr(firebase_auth, "verify_id_token", verify_id_token)
    token = await firebase_verifier.verify("token")
    assert seen["check_revoked"] is True
    assert (token.uid, token.phone_number, token.email) == ("fb-1", "+910000000000", None)
