"""SQLAlchemy models for departments. PRIVATE to this module.

Colocated with the code that uses them rather than in a central models/
package, which becomes a merge-conflict hotspot with seven developers.
"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.shared.models import TimestampMixin, UUIDMixin


class Department(UUIDMixin, TimestampMixin, Base):
    """A line department, e.g. PHED or Rural Works. Scope for department users."""

    __tablename__ = "departments"

    code: Mapped[str] = mapped_column(String(32), unique=True)
    name: Mapped[str] = mapped_column(String(160))
