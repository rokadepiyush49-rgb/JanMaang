"""Settings parsing tests.

CORS_ORIGINS is the one setting whose env representation does not match its
Python type, and getting it wrong takes the whole process down at import time
rather than failing a request — every deployed environment boots through here.
"""

import pytest

from app.core.config import Settings

_REQUIRED = {
    "DATABASE_URL": "postgresql+asyncpg://janmaang:janmaang@localhost:5432/janmaang",
    "REDIS_URL": "redis://localhost:6379/0",
    "AUTH_SECRET": "dev-only-not-a-real-secret-change-me",
}


@pytest.fixture
def env(monkeypatch: pytest.MonkeyPatch) -> None:
    # Settings reads a .env file when one exists; an isolated environment keeps
    # the result the same on a developer machine and in CI.
    monkeypatch.chdir("/")
    for key, value in _REQUIRED.items():
        monkeypatch.setenv(key, value)


@pytest.mark.usefixtures("env")
def test_comma_separated_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    """The form used by .env.example, and so the form CI boots with."""
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080")
    assert Settings().cors_origins == ["http://localhost:3000", "http://localhost:8080"]


@pytest.mark.usefixtures("env")
def test_single_origin_is_not_json(monkeypatch: pytest.MonkeyPatch) -> None:
    """A bare URL is not valid JSON — decoding it raised SettingsError at boot."""
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000")
    assert Settings().cors_origins == ["http://localhost:3000"]


@pytest.mark.usefixtures("env")
def test_json_array_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    """Still accepted: deployed secret stores may already hold this form."""
    monkeypatch.setenv("CORS_ORIGINS", '["http://a.example","http://b.example"]')
    assert Settings().cors_origins == ["http://a.example", "http://b.example"]


@pytest.mark.usefixtures("env")
def test_surrounding_whitespace_and_empty_entries_are_dropped(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CORS_ORIGINS", " http://a.example , , http://b.example ,")
    assert Settings().cors_origins == ["http://a.example", "http://b.example"]


@pytest.mark.usefixtures("env")
def test_unset_origins_disables_cors(monkeypatch: pytest.MonkeyPatch) -> None:
    """main.py adds the middleware only when this is truthy."""
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    assert Settings().cors_origins == []
