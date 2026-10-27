from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ACME SalaryHub API"
    app_env: str = "development"
    database_url: str = (
        "postgresql+psycopg://postgres:password@localhost:5432/salaryhub"
    )
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    auth_secret_key: str = ""
    auth_manager_email: str = ""
    auth_manager_password_hash: str = ""
    auth_token_expire_minutes: int = 30

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


settings = Settings()