from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "otica-photos"
    r2_public_url: str = ""
    meta_wa_phone_number_id: str = ""
    meta_wa_token: str = ""
    meta_wa_verify_token: str = "otica-verify"
    secret_key: str = "change-me"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
