"""SQLAlchemy models for problems. PRIVATE to this module.

Colocated with the code that uses them rather than in a central models/
package, which becomes a merge-conflict hotspot with seven developers.

A demand is one citizen's report. Duplicates of the same physical problem are
grouped into a cluster; the cluster is what gets ranked and funded. Server-only
fields (status, cluster, score, supporter count) are written by the pipeline,
never accepted from a client.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from geoalchemy2 import Geography
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.shared.enums import ProblemStatus, Severity
from app.shared.models import TimestampMixin, UUIDMixin

from .schemas import DemandCategory, VerificationKind


def _values(enum_cls: type[Any]) -> list[str]:
    return [member.value for member in enum_cls]


_POINT = Geography(geometry_type="POINT", srid=4326, spatial_index=False)


class Cluster(UUIDMixin, TimestampMixin, Base):
    """Demands judged to be the same physical problem (PostGIS + similarity)."""

    __tablename__ = "clusters"
    __table_args__ = (Index("ix_clusters_centroid", "centroid", postgresql_using="gist"),)

    centroid: Mapped[Any] = mapped_column(_POINT)
    demand_count: Mapped[int] = mapped_column(Integer, default=1, server_default=text("1"))


class Demand(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "demands"
    __table_args__ = (
        CheckConstraint("char_length(title) > 0", name="title_not_empty"),
        CheckConstraint("supporter_count >= 0", name="supporter_count_non_negative"),
        Index("ix_demands_location", "location", postgresql_using="gist"),
        Index("ix_demands_district_id_status", "district_id", "status"),
    )

    # Human-readable reference a citizen can read out over the phone.
    code: Mapped[str] = mapped_column(String(16), unique=True)
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="", server_default="")
    category: Mapped[DemandCategory] = mapped_column(
        Enum(DemandCategory, name="demand_category", values_callable=_values)
    )
    severity: Mapped[Severity] = mapped_column(
        Enum(Severity, name="severity", values_callable=_values)
    )
    # BCP-47 tag of the language the citizen used.
    language: Mapped[str | None] = mapped_column(String(16))

    location: Mapped[Any] = mapped_column(_POINT)
    gram_panchayat_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("gram_panchayats.id", ondelete="RESTRICT"), index=True
    )
    # No single-column index: ix_demands_district_id_status leads with it.
    district_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("districts.id", ondelete="RESTRICT")
    )

    # Server-only from here down.
    status: Mapped[ProblemStatus] = mapped_column(
        Enum(ProblemStatus, name="problem_status", values_callable=_values),
        default=ProblemStatus.REPORTED,
        server_default=ProblemStatus.REPORTED.value,
        index=True,
    )
    cluster_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("clusters.id", ondelete="SET NULL"), index=True
    )
    priority_score: Mapped[Decimal | None] = mapped_column(Numeric(6, 3))
    supporter_count: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))


class DemandSupporter(Base):
    """A citizen backing someone else's demand. Grants the right to verify it."""

    __tablename__ = "demand_supporters"

    demand_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("demands.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), primary_key=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Verification(UUIDMixin, Base):
    """A verdict on completed work. One per person per demand per kind."""

    __tablename__ = "verifications"
    __table_args__ = (UniqueConstraint("demand_id", "verifier_id", "kind"),)

    demand_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("demands.id", ondelete="CASCADE"), index=True
    )
    verifier_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )
    kind: Mapped[VerificationKind] = mapped_column(
        Enum(VerificationKind, name="verification_kind", values_callable=_values)
    )
    is_fixed: Mapped[bool] = mapped_column(Boolean)
    checklist: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB, default=list, server_default=text("'[]'::jsonb")
    )
    photo_urls: Mapped[list[str]] = mapped_column(
        ARRAY(Text), default=list, server_default=text("'{}'::text[]")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
