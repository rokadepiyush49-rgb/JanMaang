"""Async SQLAlchemy engine, session factory and the declarative base.

PostGIS and pgvector are enabled by the first migration, not here — the schema
is owned entirely by Alembic so a fresh clone and production converge.
"""

from collections.abc import AsyncGenerator, Callable, Collection
from typing import Any, Final

from geoalchemy2.types import Geography, Geometry
from sqlalchemy import Connection, MetaData, text
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


# Always skipped, also in offline mode where the database cannot be asked.
POSTGIS_RELATIONS: Final[frozenset[str]] = frozenset(
    {"spatial_ref_sys", "geography_columns", "geometry_columns"}
)


def extension_owned_relations(connection: Connection) -> frozenset[str]:
    """Tables and views that belong to an installed extension, not to us.

    The postgis/postgis image also installs the TIGER geocoder, topology and
    address standardizer, ~70 tables that schema comparison would otherwise
    report as "should be dropped". Asking pg_depend which relations are
    extension members excludes them without a hand-kept list, and still
    reports any stray table of our own.
    """
    rows = connection.execute(
        text(
            "SELECT c.relname FROM pg_catalog.pg_class c "
            "JOIN pg_catalog.pg_depend d ON d.classid = 'pg_catalog.pg_class'::regclass "
            "AND d.objid = c.oid AND d.deptype = 'e'"
        )
    )
    return POSTGIS_RELATIONS | frozenset(row[0] for row in rows)


def include_object_excluding(owned: Collection[str]) -> Callable[..., bool]:
    """An Alembic include_object hook that skips the given tables and their indexes."""

    def include_object(
        obj: Any, name: str | None, type_: str, _reflected: bool, _compare_to: Any
    ) -> bool:
        table = name if type_ == "table" else getattr(getattr(obj, "table", None), "name", None)
        return table not in owned

    return include_object


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
