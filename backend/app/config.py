from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SYNTEX_", env_file=".env", extra="ignore")

    app_name: str = "Syntex API"
    cors_origins: str = "*"  # comma-separated list, or * for dev


def get_settings() -> Settings:
    return Settings()
