from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    DATABASE_URL: str = ""
    GEMINI_API_KEY: str = ""

    # Cấu hình theo chuẩn Pydantic v2
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings() # Nếu vẫn đỏ, hãy dùng Cách 1 ở trên