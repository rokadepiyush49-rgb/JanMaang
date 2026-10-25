"""Database access for audit. PRIVATE to this module.

Only service.py in this module may call these functions.
"""

from collections.abc import Sequence

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from .models import AuditEvent

# Arbitrary but fixed: every writer takes the same transaction-scoped lock, so
# two concurrent inserts can never read the same "latest" hash and fork the chain.
_CHAIN_LOCK_KEY = 0x4A4D_4155  # "JMAU"


async def lock_chain(db: AsyncSession) -> None:
    await db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": _CHAIN_LOCK_KEY})


async def latest_hash(db: AsyncSession) -> str | None:
    result = await db.execute(select(AuditEvent.hash).order_by(AuditEvent.id.desc()).limit(1))
    return result.scalar_one_or_none()


async def insert(db: AsyncSession, event: AuditEvent) -> None:
    db.add(event)
    await db.flush()


async def all_in_order(db: AsyncSession) -> Sequence[AuditEvent]:
    result = await db.execute(select(AuditEvent).order_by(AuditEvent.id))
    return result.scalars().all()
