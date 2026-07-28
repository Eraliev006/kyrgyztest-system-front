from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        extra='ignore',
    )

    base_url: str
    base_ui_url: str

    admin_login: str
    admin_password: str

    exam_kiosk_password: str

    headless: bool = True
    slow_mo: int = 0


settings = Settings()  # type: ignore
