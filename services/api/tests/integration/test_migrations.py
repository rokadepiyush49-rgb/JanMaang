"""The migrations and the models describe the same schema, in both directions.

Autogenerate is only as good as this check: if a model changes without a
migration, or a migration is edited without the model, the diff below is not
empty and CI fails before the drift reaches production.
"""

import asyncio
from pathlib import Path
from typing import Any

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

# Same registrations as app/migrations/env.py, without running env.py.
from app.core.database import Base, compare_type
from app.modules.academics import models as _academics  # noqa: F401
from app.modules.audit import models as _audit  # noqa: F401
from app.modules.departments import models as _departments  # noqa: F401
from app.modules.geography import models as _geography  # noqa: F401
from app.modules.problems import models as _problems  # noqa: F401
from app.modules.users import models as _users  # noqa: F401

from .conftest import database_url, require_database_sync

pytestmark = pytest.mark.integration

API_ROOT = Path(__file__).resolve().parents[2]
_POSTGIS_TABLES = {"spatial_ref_sys", "geography_columns", "geometry_columns"}


def _alembic_config() -> Config:
    config = Config(str(API_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(API_ROOT / "app" / "migrations"))
    return config


def _include(_obj: object, name: str | None, type_: str, *_: object) -> bool:
    return not (type_ == "table" and name in _POSTGIS_TABLES)


def _schema_diff() -> list[Any]:
    async def diff() -> list[Any]:
        engine = create_async_engine(database_url(), poolclass=NullPool)
        try:
            async with engine.connect() as conn:

                def compare(sync_conn: Any) -> list[Any]:
                    context = MigrationContext.configure(
                        sync_conn, opts={"compare_type": compare_type, "include_object": _include}
                    )
                    return list(compare_metadata(context, Base.metadata))

                return await conn.run_sync(compare)
        finally:
            await engine.dispose()

    return asyncio.run(diff())


def test_migrated_schema_matches_the_models() -> None:
    require_database_sync()
    command.upgrade(_alembic_config(), "head")
    assert _schema_diff() == []


def test_downgrade_to_base_and_back_is_clean() -> None:
    require_database_sync()
    config = _alembic_config()
    command.downgrade(config, "base")
    command.upgrade(config, "head")
    assert _schema_diff() == []
