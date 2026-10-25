"""Alembic environment.

Reads DATABASE_URL from app settings rather than alembic.ini, so migrations and
the application can never disagree about which database they mean.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import get_settings
from app.core.database import (
    POSTGIS_RELATIONS,
    Base,
    compare_type,
    extension_owned_relations,
    include_object_excluding,
)

# Importing every module's models registers them on Base.metadata so
# --autogenerate sees the full schema. Importing the package alone is not
# enough: a module's __init__ does not import its models. Add new modules here.
from app.modules.academics import models as _academics  # noqa: F401
from app.modules.audit import models as _audit  # noqa: F401
from app.modules.departments import models as _departments  # noqa: F401
from app.modules.geography import models as _geography  # noqa: F401
from app.modules.problems import models as _problems  # noqa: F401
from app.modules.users import models as _users  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", str(get_settings().database_url))
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        # Offline there is no database to ask which tables extensions own.
        include_object=include_object_excluding(POSTGIS_RELATIONS),
        compare_type=compare_type,
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run_migrations(connection: Connection) -> None:
    # Skip every extension's tables (PostGIS, TIGER geocoder, topology).
    extension_tables = extension_owned_relations(connection)
    # That SELECT auto-began a transaction. End it before configure(): Alembic
    # treats a transaction it finds open as the caller's and never commits it,
    # so every migration would silently roll back when the connection closed.
    connection.commit()
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=include_object_excluding(extension_tables),
        compare_type=compare_type,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(_do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
