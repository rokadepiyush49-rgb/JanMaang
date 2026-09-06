"""Typed application settings.

Every environment variable the API reads is declared here. Nothing else in the
codebase may call ``os.getenv`` — a typo in a variable name should fail at
startup, not at 2am in the middle of a demo.
"""

import json
from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

Environment = Literal["development", "staging", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: Environment = "development"
    debug: bool = False
    log_level: str = "INFO"

    database_url: PostgresDsn
    database_pool_size: int = 10
    redis_url: RedisDsn

    ai_service_url: str = "http://localhost:8001"
    ai_service_key: str = ""
    ai_request_timeout_seconds: int = 30

    firebase_project_id: str = ""
    firebase_credentials_path: str = ""
    firebase_credentials_json: str = ""

    storage_provider: Literal["firebase", "s3"] = "firebase"
    storage_bucket: str = ""
    storage_signed_url_ttl_seconds: int = 3600

    maps_api_key: str = ""

    auth_secret: str = Field(min_length=16)
    access_token_ttl_minutes: int = 60

    # NoDecode: pydantic-settings JSON-decodes complex types inside the env
    # source, which happens *before* any validator runs — so a plain
    # comma-separated CORS_ORIGINS raised SettingsError at import time.
    # Opting out of that decode is what lets _split_origins see the raw string.
    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, v: str | list[str]) -> list[str]:
        if not isinstance(v, str):
            return v
        # A JSON array is still accepted: it is what pydantic-settings decoded
        # for us before NoDecode, so deployed environments may already hold one.
        if v.lstrip().startswith("["):
            decoded = json.loads(v)
            return [str(o).strip() for o in decoded if str(o).strip()]
        return [o.strip() for o in v.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached so the file is parsed once per process."""
    return Settings()
