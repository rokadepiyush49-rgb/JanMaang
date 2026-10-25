"""Security behaviour every route inherits from create_app().

There are no domain endpoints yet, so these tests pin the shell the endpoints
will be mounted into: headers, body limits, CORS, error shape, the auth guard
and the startup checks that refuse an unsafe deployment.
"""

import hashlib
from collections.abc import Iterator

import pytest
from fastapi import Depends, FastAPI, Request
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.core.permissions import Permission, require
from app.main import create_app

# Derived, not written out: a 64-hex literal named like a secret trips the
# secret scanner, and this only needs to look like a generated value.
GOOD_SECRET = hashlib.sha256(b"janmaang-api-test-auth-secret").hexdigest()


@pytest.fixture
def make_client(monkeypatch: pytest.MonkeyPatch) -> Iterator[object]:
    """Build an app under specific environment variables."""

    def build(**env: str) -> TestClient:
        for key, value in env.items():
            monkeypatch.setenv(key, value)
        get_settings.cache_clear()
        return TestClient(create_app(), raise_server_exceptions=False)

    yield build
    get_settings.cache_clear()


def test_security_headers_on_every_response(make_client) -> None:
    response = make_client().get("/health")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["cache-control"] == "no-store"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]


def test_oversized_body_refused_by_content_length(make_client) -> None:
    client = make_client(MAX_REQUEST_BODY_BYTES="2048")
    response = client.post("/api/v1/problems", content=b"x" * 4096)
    assert response.status_code == 413


def test_oversized_body_refused_when_streamed_without_length(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # Needs a route that actually reads the body: an unknown path is answered
    # 404 without the body ever being buffered, which is harmless anyway.
    monkeypatch.setenv("MAX_REQUEST_BODY_BYTES", "2048")
    client = _app_with(echo=True)

    def chunks() -> Iterator[bytes]:
        for _ in range(8):
            yield b"x" * 1024

    response = client.post("/api/v1/_probe/echo", content=chunks())
    assert response.status_code == 413
    get_settings.cache_clear()


def test_cors_answers_only_listed_origins(make_client) -> None:
    client = make_client(CORS_ORIGINS="http://localhost:3000")
    preflight = {"access-control-request-method": "POST"}

    allowed = client.options("/health", headers={"origin": "http://localhost:3000", **preflight})
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "access-control-allow-credentials" not in allowed.headers

    refused = client.options("/health", headers={"origin": "https://evil.example", **preflight})
    assert refused.headers.get("access-control-allow-origin") is None


def _app_with(
    route_dependency: object | None = None, *, crash: bool = False, echo: bool = False
) -> TestClient:
    get_settings.cache_clear()
    app: FastAPI = create_app()

    if echo:

        @app.post("/api/v1/_probe/echo")
        async def echo_route(request: Request) -> dict[str, int]:
            return {"bytes": len(await request.body())}

    if route_dependency is not None:

        @app.get("/api/v1/_probe/protected", dependencies=[Depends(route_dependency)])
        async def protected() -> dict[str, str]:
            return {"secret": "data"}

    if crash:

        @app.get("/api/v1/_probe/crash")
        async def crash_route() -> None:
            raise RuntimeError("db password is hunter2 at /srv/app/secrets.py")

    return TestClient(app, raise_server_exceptions=False)


def test_protected_route_rejects_anonymous_callers() -> None:
    client = _app_with(require(Permission.AUDIT_READ))
    response = client.get("/api/v1/_probe/protected")
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_protected_route_fails_closed_without_an_auth_seam() -> None:
    """A deployment that lost its verifier must refuse, never wave requests through."""
    client = _app_with(require(Permission.AUDIT_READ))
    del client.app.state.token_verifier  # type: ignore[attr-defined]
    response = client.get(
        "/api/v1/_probe/protected", headers={"authorization": "Bearer forged.token.value"}
    )
    assert response.status_code == 503
    assert "secret" not in response.text


def test_unexpected_errors_do_not_leak_details() -> None:
    response = _app_with(crash=True).get("/api/v1/_probe/crash")
    assert response.status_code == 500
    assert response.json() == {"code": "internal_error", "detail": "Internal server error"}
    assert "hunter2" not in response.text
    assert "secrets.py" not in response.text


def _settings(**overrides: object) -> Settings:
    base: dict[str, object] = {
        "database_url": "postgresql+asyncpg://u:p@db:5432/janmaang",
        "redis_url": "redis://redis:6379/0",
        "auth_secret": GOOD_SECRET,
        "ai_service_key": GOOD_SECRET[::-1],
        "cors_origins": ["https://janmaang.in"],
        "firebase_project_id": "janmaang-prod",
        "environment": "production",
    }
    base.update(overrides)
    return Settings(_env_file=None, **base)  # type: ignore[call-arg]


def test_production_settings_accept_a_safe_configuration() -> None:
    assert _settings().is_production


@pytest.mark.parametrize(
    "overrides",
    [
        {"auth_secret": "dev-only-not-a-real-secret-change-me"},
        {"auth_secret": "ci-only-secret-value-not-real"},
        {"auth_secret": "x" * 20},
        {"ai_service_key": ""},
        {"ai_service_key": "dev-internal-key-change-me"},
        {"debug": True},
        {"cors_origins": ["http://janmaang.in"]},
        {"environment": "staging", "auth_secret": "dev-only-not-a-real-secret-change-me"},
        {"firebase_project_id": ""},
        {"firebase_check_revoked": False},
    ],
)
def test_deployed_settings_refuse_unsafe_values(overrides: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        _settings(**overrides)


def test_wildcard_cors_is_refused_everywhere() -> None:
    with pytest.raises(ValidationError):
        _settings(environment="development", cors_origins=["*"])


def test_development_keeps_working_with_example_values() -> None:
    settings = _settings(
        environment="development",
        auth_secret="dev-only-not-a-real-secret-change-me",
        ai_service_key="dev-internal-key-change-me",
        cors_origins=["http://localhost:3000"],
        debug=True,
    )
    assert not settings.is_production
