"""Accounts and the audit log against the real schema (PostgreSQL + PostGIS)."""

import uuid

import pytest
from sqlalchemy import func, select, text, update
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.roles import Role
from app.core.security import AccountDisabledError, VerifiedToken
from app.modules.audit import service as audit
from app.modules.audit.models import AuditEvent
from app.modules.geography.models import Block, District, GramPanchayat
from app.modules.users import service as users
from app.modules.users.models import User

pytestmark = pytest.mark.integration


def _token(**claims: object) -> VerifiedToken:
    return VerifiedToken(
        uid=f"fb-{uuid.uuid4().hex[:12]}",
        phone_number="+910000000001",
        name="  Sunita Devi  ",
        claims=claims,
    )


async def test_register_creates_one_citizen_and_audits_it(db: AsyncSession) -> None:
    token = _token()
    account, created = await users.register_citizen(db, token)
    assert created is True
    assert account.role is Role.CITIZEN
    assert account.display_name == "Sunita Devi"

    again, created_again = await users.register_citizen(db, token)
    assert created_again is False
    assert again.id == account.id

    rows = await db.scalar(
        select(func.count()).select_from(User).where(User.firebase_uid == token.uid)
    )
    assert rows == 1
    events = (
        await db.scalars(select(AuditEvent).where(AuditEvent.entity_id == str(account.id)))
    ).all()
    assert [event.action for event in events] == ["user.registered"]
    assert await audit.verify_chain(db) is None


async def test_role_claims_in_the_token_never_grant_a_role(db: AsyncSession) -> None:
    account, _ = await users.register_citizen(db, _token(role="super_admin", officer=True))
    assert account.role is Role.CITIZEN


async def test_registering_again_does_not_reset_a_granted_role(db: AsyncSession) -> None:
    token = _token()
    account, _ = await users.register_citizen(db, token)
    await db.execute(update(User).where(User.id == account.id).values(role=Role.OFFICER))
    again, created = await users.register_citizen(db, token)
    assert created is False
    assert again.role is Role.OFFICER


async def test_resolver_returns_role_and_scope_from_the_database(db: AsyncSession) -> None:
    suffix = uuid.uuid4().hex[:6]
    district = District(lgd_code=f"D{suffix}", name="Ranchi", state_code="20")
    db.add(district)
    await db.flush()
    block = Block(district_id=district.id, lgd_code=f"B{suffix}", name="Angara")
    db.add(block)
    await db.flush()
    panchayat = GramPanchayat(block_id=block.id, lgd_code=f"G{suffix}", name="Getalsud")
    db.add(panchayat)
    await db.flush()

    token = _token()
    account, _ = await users.register_citizen(db, token)
    await db.execute(
        update(User)
        .where(User.id == account.id)
        .values(role=Role.PANCHAYAT, district_id=district.id, gram_panchayat_id=panchayat.id)
    )
    db.expire_all()

    principal = await users.resolve_principal(db, token)
    assert principal is not None
    assert principal.role is Role.PANCHAYAT
    assert principal.gram_panchayat_id == panchayat.id
    assert principal.district_id == district.id


async def test_deactivated_accounts_are_locked_out(db: AsyncSession) -> None:
    token = _token()
    account, _ = await users.register_citizen(db, token)
    await db.execute(update(User).where(User.id == account.id).values(is_active=False))
    db.expire_all()

    with pytest.raises(AccountDisabledError):
        await users.resolve_principal(db, token)
    with pytest.raises(AccountDisabledError):
        await users.register_citizen(db, token)


async def test_unknown_firebase_users_resolve_to_nothing(db: AsyncSession) -> None:
    assert await users.resolve_principal(db, _token()) is None


async def test_audit_chain_links_and_detects_tampering(db: AsyncSession) -> None:
    for n in range(3):
        await audit.record(
            db,
            actor_id=None,
            action="test.event",
            entity_type="probe",
            entity_id=str(n),
            payload={"n": n},
        )
    events = (await db.scalars(select(AuditEvent).order_by(AuditEvent.id))).all()
    assert audit.first_broken_link(events) is None
    assert events[-1].prev_hash == events[-2].hash

    # Tamper in memory only (the table refuses UPDATE): change one payload and
    # the chain must name that exact row.
    tampered = events[-2]
    tampered.payload = {"n": 999}
    assert audit.first_broken_link(events) == tampered.id
    db.expunge_all()


@pytest.mark.parametrize(
    "statement",
    [
        "UPDATE audit_events SET action = 'edited'",
        "DELETE FROM audit_events",
        "TRUNCATE audit_events",
    ],
)
async def test_the_database_refuses_to_edit_the_audit_log(db: AsyncSession, statement: str) -> None:
    await audit.record(db, actor_id=None, action="test.event", entity_type="probe", entity_id="x")
    with pytest.raises(DBAPIError, match="append-only"):
        async with db.begin_nested():
            await db.execute(text(statement))
