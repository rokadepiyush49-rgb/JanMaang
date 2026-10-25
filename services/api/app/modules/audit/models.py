"""SQLAlchemy models for audit. PRIVATE to this module.

Colocated with the code that uses them rather than in a central models/
package, which becomes a merge-conflict hotspot with seven developers.

Append-only and hash-chained: each row's ``hash`` covers its own content and
the previous row's hash, so an edited or deleted row breaks every hash after
it. The initial migration also installs a trigger that refuses UPDATE and
DELETE outright; the chain is how an auditor proves the trigger was not
bypassed with superuser access.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"
    __table_args__ = (Index("ix_audit_events_entity_type_entity_id", "entity_type", "entity_id"),)

    id: Mapped[int] = mapped_column(BigInteger, Identity(always=True), primary_key=True)
    # Set by the writer, not the database: the hash covers it, so it must be
    # known before the INSERT.
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # Null for events the system itself performs (a scheduled job, a migration).
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )
    action: Mapped[str] = mapped_column(String(64), index=True)
    entity_type: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str] = mapped_column(String(64))
    payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB, default=dict, server_default=text("'{}'::jsonb")
    )
    prev_hash: Mapped[str | None] = mapped_column(String(64))
    hash: Mapped[str] = mapped_column(String(64), unique=True)
