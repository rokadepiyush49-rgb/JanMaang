"""Fixtures for tests that need a real PostgreSQL with PostGIS.

CI (ci-api.yml) provides one and runs `alembic upgrade head` before pytest.
Locally these tests skip when no database is reachable; in CI (CI=true) an
unreachable database is a failure, so they can never silently stop running.

Each test gets a session inside a transaction that is rolled back afterwards,
so tests never see each other's rows and the CI database stays clean.
"""

import asyncio
import os
from collections.abc import AsyncIterator

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings


def database_url() -> str:
    return str(get_settings().database_url)


async def _postgis_available() -> bool:
    engine = create_async_engine(database_url(), poolclass=NullPool)
    try:
        async with engine.connect() as conn:
            found = await conn.scalar(
                text("SELECT 1 FROM pg_available_extensions WHERE name = 'postgis'")
            )
            return found == 1
    except Exception:  # any failure means "no usable database here"
        return False
    finally:
        await engine.dispose()


def _skip_or_fail() -> None:
    if os.environ.get("CI") == "true":
        pytest.fail("Integration tests need PostgreSQL + PostGIS at DATABASE_URL")
    pytest.skip("No PostgreSQL + PostGIS at DATABASE_URL")


def require_database_sync() -> None:
    """For synchronous tests (the Alembic ones, which run their own event loop)."""
    if not asyncio.run(_postgis_available()):
        _skip_or_fail()


@pytest.fixture
async def db() -> AsyncIterator[AsyncSession]:
    if not await _postgis_available():
        _skip_or_fail()
    engine = create_async_engine(database_url(), poolclass=NullPool)
    async with engine.connect() as connection:
        outer = await connection.begin()
        session = AsyncSession(
            bind=connection,
            expire_on_commit=False,
            join_transaction_mode="create_savepoint",
        )
        try:
            yield session
        finally:
            await session.close()
            await outer.rollback()
    await engine.dispose()
