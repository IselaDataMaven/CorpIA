from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/


class Settings(BaseSettings):
    """Configuración central de CorpIA Backend.

    Todos los valores tienen defaults funcionales para desarrollo local;
    en producción se sobreescriben mediante variables de entorno o .env.
    """

    APP_NAME: str = "CorpIA API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Seguridad / JWT
    SECRET_KEY: str = "corpia-dev-secret-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 horas

    # Base de datos
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'corpia.db'}"

    # Almacenamiento de archivos y vectores
    UPLOADS_DIR: Path = BASE_DIR / "data" / "uploads"
    CHROMA_DIR: Path = BASE_DIR / "data" / "chroma"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # RAG
    CHUNK_SIZE: int = 900
    CHUNK_OVERLAP: int = 150
    TOP_K_RESULTS: int = 4
    MAX_UPLOAD_SIZE_MB: int = 25

    # Proveedores de modelos IA soportados (llaves reales se cargan por /settings)
    DEFAULT_AI_MODEL: str = "corpia-local"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
