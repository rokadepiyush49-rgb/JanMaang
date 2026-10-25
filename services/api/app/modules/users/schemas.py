"""Pydantic request/response models for users.

Public: these are what generate the OpenAPI spec, and from it the
TypeScript client and Dart models in packages/contracts.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.roles import Role


class UsersBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserRead(UsersBase):
    """The caller's own account. Contact fields are only ever returned to their owner."""

    id: uuid.UUID
    role: Role
    display_name: str | None
    email: str | None
    phone_number: str | None
    district_id: uuid.UUID | None
    gram_panchayat_id: uuid.UUID | None
    department_id: uuid.UUID | None
    institute_id: uuid.UUID | None
    is_active: bool
    created_at: datetime
