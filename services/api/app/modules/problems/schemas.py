"""Pydantic request/response models for problems.

Public: these are what generate the OpenAPI spec, and from it the
TypeScript client and Dart models in packages/contracts.
"""

from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class DemandCategory(StrEnum):
    """What a demand is about. Same set the analyzeReport Function classifies into."""

    WATER = "water"
    ROADS = "roads"
    LIGHTING = "lighting"
    SANITATION = "sanitation"
    HEALTH = "health"
    EDUCATION = "education"
    ELECTRICITY = "electricity"
    TRANSPORT = "transport"
    OTHER = "other"


class VerificationKind(StrEnum):
    """A citizen's verdict closes a demand; an officer's alone never does."""

    CITIZEN = "citizen"
    FIELD = "field"


class ProblemsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# TODO(problems): Create / Update / Read schemas.
