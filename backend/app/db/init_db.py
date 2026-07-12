from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.db.models import ApiKeyRecord, AppSetting, User

# Deben coincidir exactamente con frontend/src/data/demoUsers.js
DEMO_USERS = [
    dict(username="admin.corpia", password="Admin2026!", full_name="Alejandra Torres",
         role_key="admin", department="Dirección General", avatar_color="#2563EB"),
    dict(username="rrhh.corpia", password="RRHH2026!", full_name="Marcos Villalba",
         role_key="hr", department="Recursos Humanos", avatar_color="#10B981"),
    dict(username="marketing.corpia", password="Mktg2026!", full_name="Daniela Ruiz",
         role_key="marketing", department="Marketing", avatar_color="#F59E0B"),
    dict(username="ti.corpia", password="TI2026!", full_name="Kevin Nakamura",
         role_key="it", department="Tecnología de la Información", avatar_color="#3B82F6"),
    dict(username="finanzas.corpia", password="Fin2026!", full_name="Paula Restrepo",
         role_key="finance", department="Finanzas", avatar_color="#0F172A"),
]

AI_PROVIDERS = [
    "openai", "gemini", "claude", "groq", "openrouter", "mistral", "deepseek", "azure", "ollama",
]

DEFAULT_SETTINGS = {
    "company_name": "CorpIA Demo Corp",
    "active_model": "corpia-local",
    "language": "es",
    "theme": "light",
    "timezone": "America/Mexico_City",
    "support_email": "soporte@corpia.demo",
    "logo_url": "",
}


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            for u in DEMO_USERS:
                db.add(
                    User(
                        username=u["username"],
                        hashed_password=hash_password(u["password"]),
                        full_name=u["full_name"],
                        role_key=u["role_key"],
                        department=u["department"],
                        avatar_color=u["avatar_color"],
                    )
                )

        if db.query(ApiKeyRecord).count() == 0:
            for provider in AI_PROVIDERS:
                db.add(
                    ApiKeyRecord(
                        provider=provider,
                        key_masked="Sin configurar",
                        key_encrypted="",
                        is_active=(provider == "ollama"),
                    )
                )

        if db.query(AppSetting).count() == 0:
            for key, value in DEFAULT_SETTINGS.items():
                db.add(AppSetting(key=key, value=value))

        db.commit()
    finally:
        db.close()
