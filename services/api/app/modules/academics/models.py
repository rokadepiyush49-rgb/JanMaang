"""SQLAlchemy models for academics. PRIVATE to this module.

Colocated with the code that uses them rather than in a central models/
package, which becomes a merge-conflict hotspot with seven developers.
"""

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.shared.models import TimestampMixin, UUIDMixin


class Institute(UUIDMixin, TimestampMixin, Base):
    """A university or college. Scope for faculty, institute and student users."""

    __tablename__ = "institutes"

    name: Mapped[str] = mapped_column(String(200))
    # AISHE code: the national higher-education register's identifier.
    aishe_code: Mapped[str | None] = mapped_column(String(16), unique=True)
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("districts.id", ondelete="RESTRICT"), index=True
    )
