"""AI service settings."""

import re
from functools import lru_cache
from typing import Literal, Self

from pydantic import Field, RedisDsn, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Matches the .env.example values; see services/api/app/core/config.py.
_PLACEHOLDER = re.compile(r"change-?me|dev-only|not-a-real|not-real|example|placeholder", re.I)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    log_level: str = "INFO"

    internal_api_key: str = ""

    llm_provider: Literal["gemini", "openai", "local"] = "gemini"
    llm_api_key: str = ""
    llm_model: str = "gemini-2.0-flash"
    llm_timeout_seconds: int = 30
    llm_max_retries: int = 2

    embedding_model: str = "text-embedding-004"
    embedding_dimensions: int = 768

    redis_url: RedisDsn | None = None
    cache_ttl_seconds: int = 86_400

    daily_token_budget: int = Field(default=2_000_000, ge=0)

    @model_validator(mode="after")
    def _deployed_environment_guards(self) -> Self:
        """Refuse to start a deployed service on a published or empty key."""
        if self.environment == "development":
            return self
        problems: list[str] = []
        if self.debug:
            problems.append("DEBUG must be false")
        key = self.internal_api_key
        if len(key) < 32 or _PLACEHOLDER.search(key):
            problems.append("INTERNAL_API_KEY must be a generated value of 32+ characters")
        if problems:
            raise ValueError(f"Unsafe {self.environment} configuration: " + "; ".join(problems))
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
