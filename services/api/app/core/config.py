"""Typed application settings.

Every environment variable the API reads is declared here. Nothing else in the
codebase may call ``os.getenv`` — a typo in a variable name should fail at
startup, not at 2am in the middle of a demo.
"""

import re
from functools import lru_cache
from typing import Annotated, Literal, Self

from pydantic import Field, PostgresDsn, RedisDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

Environment = Literal["development", "staging", "production"]

# The .env.example values are published in this repository and long enough
# to pass a length check, so a deploy that copied the example file would run
# on keys anyone can read. Deployed environments refuse anything shaped like
# a placeholder.
_PLACEHOLDER = re.compile(r"change-?me|dev-only|not-a-real|not-real|example|placeholder", re.I)


def _is_placeholder(value: str) -> bool:
    return bool(_PLACEHOLDER.search(value))


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

    # NoDecode: without it pydantic-settings JSON-parses list fields from the
    # environment before _split_origins runs, so the documented
    # CORS_ORIGINS=http://localhost:3000 crashed startup.
    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)

    # Bodies are small JSON: photos and audio go straight to storage through
    # presigned URLs, never through the API. Anything bigger is refused early.
    max_request_body_bytes: int = Field(default=1_000_000, ge=1_024)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    @field_validator("cors_origins")
    @classmethod
    def _no_wildcard_origin(cls, v: list[str]) -> list[str]:
        # With credentials allowed, Starlette answers a wildcard by echoing
        # the caller's Origin — every site on the internet becomes trusted.
        if "*" in v:
            raise ValueError("CORS_ORIGINS must list origins explicitly, not '*'")
        return v

    @model_validator(mode="after")
    def _deployed_environment_guards(self) -> Self:
        """Fail at startup, not at the first forged request."""
        if self.environment == "development":
            return self
        problems: list[str] = []
        if self.debug:
            problems.append("DEBUG must be false")
        if len(self.auth_secret) < 32 or _is_placeholder(self.auth_secret):
            problems.append("AUTH_SECRET must be a generated value of 32+ characters")
        if not self.ai_service_key or _is_placeholder(self.ai_service_key):
            problems.append("AI_SERVICE_KEY must be set to a generated value")
        insecure = [o for o in self.cors_origins if not o.startswith("https://")]
        if insecure:
            problems.append(f"CORS_ORIGINS must be https in {self.environment}: {insecure}")
        if problems:
            raise ValueError(f"Unsafe {self.environment} configuration: " + "; ".join(problems))
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached so the file is parsed once per process."""
    return Settings()
