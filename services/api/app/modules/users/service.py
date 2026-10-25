"""Business logic for users. THE PUBLIC FACE of this module.

Profiles, preferences and account lifecycle.

# Module boundary: other modules may import this file and schemas.py.
# They must NEVER import models.py or repository.py — see the import-linter
# contract in pyproject.toml. That rule is what makes this module extractable
# into its own service later without touching a single caller.
"""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.core.roles import Role
from app.core.security import AccountDisabledError, Principal, VerifiedToken
from app.modules.audit import service as audit

from . import repository
from .schemas import UserRead


def _clip(value: str | None, limit: int) -> str | None:
    """Token claims come from the identity provider; still bound them to the columns."""
    if not value:
        return None
    return value.strip()[:limit] or None


async def resolve_principal(db: AsyncSession, token: VerifiedToken) -> Principal | None:
    """The PrincipalResolver wired into app.state by create_app().

    None means "verified with Firebase but never registered". Role and scope
    come from the database only — never from token claims (ADR 0006).
    """
    user = await repository.get_by_firebase_uid(db, token.uid)
    if user is None:
        return None
    if not user.is_active:
        raise AccountDisabledError
    return Principal(
        user_id=user.id,
        firebase_uid=user.firebase_uid,
        role=user.role,
        district_id=user.district_id,
        gram_panchayat_id=user.gram_panchayat_id,
        department_id=user.department_id,
        institute_id=user.institute_id,
    )


async def register_citizen(db: AsyncSession, token: VerifiedToken) -> tuple[UserRead, bool]:
    """Create the caller's account as a citizen, or return the existing one.

    Returns (account, created). Self-registration can only ever produce a
    citizen: any other role is granted by an admin. An existing account is
    returned unchanged whatever its role — calling register again is not a
    way to reset or downgrade it.
    """
    created = await repository.insert_citizen_if_absent(
        db,
        firebase_uid=token.uid,
        display_name=_clip(token.name, 120),
        email=_clip(token.email, 254),
        phone_number=_clip(token.phone_number, 20),
    )
    if created is not None:
        await audit.record(
            db,
            actor_id=created.id,
            action="user.registered",
            entity_type="user",
            entity_id=str(created.id),
            payload={"role": Role.CITIZEN.value},
        )
        return UserRead.model_validate(created), True

    existing = await repository.get_by_firebase_uid(db, token.uid)
    if existing is None:  # pragma: no cover - the insert just conflicted on this uid
        raise NotFoundError("Account vanished during registration")
    if not existing.is_active:
        raise AccountDisabledError
    return UserRead.model_validate(existing), False


async def get_profile(db: AsyncSession, user_id: uuid.UUID) -> UserRead:
    user = await repository.get(db, user_id)
    if user is None:
        raise NotFoundError("Account not found")
    return UserRead.model_validate(user)
