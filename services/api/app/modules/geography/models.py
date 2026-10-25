"""SQLAlchemy models for geography. PRIVATE to this module.

Colocated with the code that uses them rather than in a central models/
package, which becomes a merge-conflict hotspot with seven developers.

Every unit carries its LGD (Local Government Directory) code: names change
with spelling reforms and transliteration, LGD codes do not, and they are what
other government systems join on. Boundaries are optional until the LGD
shapefiles are loaded; a demand's panchayat can be set by hand until then.
"""

import uuid
from typing import Any

from geoalchemy2 import Geography
from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.shared.models import TimestampMixin, UUIDMixin

# spatial_index=False everywhere: the GiST indexes are declared explicitly in
# __table_args__ so the model and the migration name them identically.
_BOUNDARY = Geography(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=False)


class District(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "districts"
    __table_args__ = (Index("ix_districts_boundary", "boundary", postgresql_using="gist"),)

    lgd_code: Mapped[str] = mapped_column(String(16), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    state_code: Mapped[str] = mapped_column(String(8))
    boundary: Mapped[Any | None] = mapped_column(_BOUNDARY, nullable=True)


class Block(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "blocks"

    district_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("districts.id", ondelete="RESTRICT"), index=True
    )
    lgd_code: Mapped[str] = mapped_column(String(16), unique=True)
    name: Mapped[str] = mapped_column(String(120))


class GramPanchayat(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "gram_panchayats"
    __table_args__ = (Index("ix_gram_panchayats_boundary", "boundary", postgresql_using="gist"),)

    block_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("blocks.id", ondelete="RESTRICT"), index=True
    )
    lgd_code: Mapped[str] = mapped_column(String(16), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    boundary: Mapped[Any | None] = mapped_column(_BOUNDARY, nullable=True)
