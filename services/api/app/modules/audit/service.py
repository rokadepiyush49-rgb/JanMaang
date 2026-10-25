"""Business logic for audit. THE PUBLIC FACE of this module.

Append-only audit log.

# Module boundary: other modules may import this file and schemas.py.
# They must NEVER import models.py or repository.py — see the import-linter
# contract in pyproject.toml. That rule is what makes this module extractable
# into its own service later without touching a single caller.

Every privileged write calls ``record()`` inside the same transaction as the
change it describes, so the change and its audit row commit or roll back
together. Each row's hash covers its content plus the previous row's hash;
``first_broken_link()`` walks the chain and names the first row that no
longer matches.
"""

import hashlib
import json
import uuid
from collections.abc import Iterable, Mapping
from datetime import UTC, datetime
from typing import Any, Protocol

from sqlalchemy.ext.asyncio import AsyncSession

from . import repository
from .models import AuditEvent


class ChainLink(Protocol):
    id: int
    occurred_at: datetime
    actor_id: uuid.UUID | None
    action: str
    entity_type: str
    entity_id: str
    payload: dict[str, Any]
    prev_hash: str | None
    hash: str


def compute_hash(
    *,
    prev_hash: str | None,
    occurred_at: datetime,
    actor_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: str,
    payload: Mapping[str, Any],
) -> str:
    """SHA-256 over a canonical JSON encoding: sorted keys, no whitespace, UTC."""
    canonical = json.dumps(
        {
            "prev_hash": prev_hash,
            "occurred_at": occurred_at.astimezone(UTC).isoformat(),
            "actor_id": str(actor_id) if actor_id else None,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "payload": payload,
        },
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        default=str,
    )
    return hashlib.sha256(canonical.encode()).hexdigest()


async def record(
    db: AsyncSession,
    *,
    actor_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: str,
    payload: Mapping[str, Any] | None = None,
) -> None:
    """Append one event. Call it in the transaction that makes the change."""
    await repository.lock_chain(db)
    prev_hash = await repository.latest_hash(db)
    occurred_at = datetime.now(UTC)
    body = dict(payload or {})
    await repository.insert(
        db,
        AuditEvent(
            occurred_at=occurred_at,
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload=body,
            prev_hash=prev_hash,
            hash=compute_hash(
                prev_hash=prev_hash,
                occurred_at=occurred_at,
                actor_id=actor_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                payload=body,
            ),
        ),
    )


def first_broken_link(events: Iterable[ChainLink]) -> int | None:
    """The id of the first event whose hash or back-link does not match, or None."""
    expected_prev: str | None = None
    for event in events:
        recomputed = compute_hash(
            prev_hash=event.prev_hash,
            occurred_at=event.occurred_at,
            actor_id=event.actor_id,
            action=event.action,
            entity_type=event.entity_type,
            entity_id=event.entity_id,
            payload=event.payload,
        )
        if event.prev_hash != expected_prev or event.hash != recomputed:
            return event.id
        expected_prev = event.hash
    return None


async def verify_chain(db: AsyncSession) -> int | None:
    """Walk the whole log. None means intact."""
    return first_broken_link(await repository.all_in_order(db))
