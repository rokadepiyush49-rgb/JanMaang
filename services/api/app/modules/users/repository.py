"""Database access for users. PRIVATE to this module.

Only service.py in this module may call these functions.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.roles import Role

from .models import User


async def get_by_firebase_uid(db: AsyncSession, firebase_uid: str) -> User | None:
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    return result.scalar_one_or_none()


async def get(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await db.get(User, user_id)


async def insert_citizen_if_absent(
    db: AsyncSession,
    *,
    firebase_uid: str,
    display_name: str | None,
    email: str | None,
    phone_number: str | None,
) -> User | None:
    """Insert a citizen row, or do nothing if one exists for this uid.

    ON CONFLICT rather than read-then-write, so two simultaneous first sign-ins
    from the same phone cannot both insert. Returns the new row, or None when
    the uid was already registered.
    """
    statement = (
        insert(User)
        .values(
            id=uuid.uuid4(),
            firebase_uid=firebase_uid,
            role=Role.CITIZEN,
            display_name=display_name,
            email=email,
            phone_number=phone_number,
        )
        .on_conflict_do_nothing(index_elements=[User.firebase_uid])
        .returning(User)
    )
    result = await db.execute(statement)
    return result.scalar_one_or_none()
