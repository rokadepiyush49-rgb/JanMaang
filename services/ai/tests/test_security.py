"""The AI service's only access control is the internal key; pin it down."""

import hashlib
from collections.abc import Iterator

import pytest
from fastapi import APIRouter
from fastapi.testclient import TestClient
from pydantic import ValidationError

import app.main as main
from app.core.config import Settings, get_settings

# Derived, not written out: a 64-hex literal named like a key trips the
# secret scanner, and this only needs to look like a generated value.
KEY = hashlib.sha256(b"janmaang-ai-service-test-key").hexdigest()


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    """An app with one probe capability, behind the same key check as the rest."""
    monkeypatch.setenv("INTERNAL_API_KEY", KEY)
    get_settings.cache_clear()

    probe = APIRouter(prefix="/v1/probe")

    @probe.post("")
    async def run() -> dict[str, str]:
        return {"result": "model output"}

    monkeypatch.setattr(main, "CAPABILITY_ROUTERS", (*main.CAPABILITY_ROUTERS, probe))
    yield TestClient(main.create_app())
    get_settings.cache_clear()


def test_capabilities_refuse_a_missing_key(client: TestClient) -> None:
    assert client.post("/v1/probe").status_code == 401


def test_capabilities_refuse_a_wrong_key(client: TestClient) -> None:
    response = client.post("/v1/probe", headers={"x-internal-key": KEY[:-1] + "0"})
    assert response.status_code == 401


def test_capabilities_accept_the_right_key(client: TestClient) -> None:
    response = client.post("/v1/probe", headers={"x-internal-key": KEY})
    assert response.status_code == 200


def test_an_unset_key_refuses_everyone(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("INTERNAL_API_KEY", "")
    get_settings.cache_clear()
    probe = APIRouter(prefix="/v1/probe")

    @probe.post("")
    async def run() -> dict[str, str]:
        return {}

    monkeypatch.setattr(main, "CAPABILITY_ROUTERS", (probe,))
    response = TestClient(main.create_app()).post("/v1/probe", headers={"x-internal-key": ""})
    assert response.status_code == 401
    get_settings.cache_clear()


@pytest.mark.parametrize("key", ["", "dev-internal-key-change-me", "short-but-random-1234"])
def test_deployed_service_refuses_weak_keys(key: str) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, environment="production", internal_api_key=key)  # type: ignore[call-arg]


def test_deployed_service_accepts_a_generated_key() -> None:
    settings = Settings(_env_file=None, environment="staging", internal_api_key=KEY)  # type: ignore[call-arg]
    assert settings.internal_api_key == KEY
