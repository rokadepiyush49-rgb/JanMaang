"""SQLAlchemy models for users. PRIVATE to this module.

Colocated with the code that uses them rather than in a central models/
package, which becomes a merge-conflict hotspot with seven developers.

Identity comes from Firebase (``firebase_uid``); everything that decides what
a user may do — role and scope — lives here, per ADR 0006. A self-registered
account is always a citizen; any other role is granted by an admin.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, true
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.roles import Role
from app.shared.models import TimestampMixin, UUIDMixin

ROLE_ENUM = Enum(
    Role,
    name="user_role",
    values_callable=lambda roles: [role.value for role in roles],
)


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True)
    role: Mapped[Role] = mapped_column(ROLE_ENUM, default=Role.CITIZEN)

    display_name: Mapped[str | None] = mapped_column(String(120))
    # Neither is unique: rural citizens sign in by phone and many share one.
    email: Mapped[str | None] = mapped_column(String(254))
    phone_number: Mapped[str | None] = mapped_column(String(20))

    # Scope. Which of these must be set depends on the role and is enforced
    # where roles are granted, not by a CHECK that would block a partial row.
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("districts.id", ondelete="RESTRICT"), index=True
    )
    gram_panchayat_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("gram_panchayats.id", ondelete="RESTRICT"), index=True
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"), index=True
    )
    institute_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("institutes.id", ondelete="RESTRICT"), index=True
    )

    # Accounts are deactivated, never deleted: audit_events reference them.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
