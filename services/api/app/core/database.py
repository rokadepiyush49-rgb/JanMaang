"""Async SQLAlchemy engine, session factory and the declarative base.

PostGIS and pgvector are enabled by the first migration, not here — the schema
is owned entirely by Alembic so a fresh clone and production converge.
"""

from collections.abc import AsyncGenerator
from typing import Any, Final

from geoalchemy2.types import Geography, Geometry
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

# Deterministic constraint names. Without these, Alembic autogenerate emits
# migrations that drop and recreate constraints under database-assigned names,
# and `downgrade()` cannot find them again.
NAMING_CONVENTION: Final[dict[str, str]] = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


def compare_type(
    _context: Any,
    _inspected_column: Any,
    _metadata_column: Any,
    _inspected_type: Any,
    metadata_type: Any,
) -> bool | None:
    """Alembic type comparison that leaves PostGIS columns alone.

    Reflected geography and geometry types differ from the declared ones in
    cosmetic parameters (dimension, spatial_index), so default comparison would
    report a change on every run. Returning None defers to Alembic for every
    other type. Used by env.py and by the schema-drift test.
    """
    if isinstance(metadata_type, Geography | Geometry):
        return False
    return None


class Base(DeclarativeBase):
    """Declarative base shared by every module's models."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


_settings = get_settings()

engine = create_async_engine(
    str(_settings.database_url),
    echo=_settings.debug,
    pool_size=_settings.database_pool_size,
    pool_pre_ping=True,
)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, Any]:
    """FastAPI dependency. One session per request, rolled back on error."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
