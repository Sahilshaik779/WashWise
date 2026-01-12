# app/core/config.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

# Calculate absolute path to .env file
current_file_dir = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(current_file_dir))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "WashWise Laundry Manager"
    API_V1_STR: str = "/api/v1"
    
    # --- Security ---
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # --- Environment & Frontend ---
    # These were missing and causing the "Extra inputs" error
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # --- Database ---
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str
    DB_ECHO: bool = False

    # --- CORS ---
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    # --- External Services (Google & Mailgun) ---
    MAILGUN_API_KEY: Optional[str] = None
    MAILGUN_DOMAIN: Optional[str] = None
    
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # This is used by the frontend build but present in .env, so we define it here to avoid errors
    VITE_API_URL: Optional[str] = None

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Configuration to read from .env
    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        case_sensitive=True,
        extra="ignore"  # This tells Pydantic to ignore any other unknown variables in .env instead of crashing
    )

settings = Settings()