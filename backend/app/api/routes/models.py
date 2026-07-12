from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.database import get_db
from app.db.models import ApiKeyRecord, AppSetting, User
from app.schemas.model import (
    ActivateModelRequest,
    ModelCatalogOut,
    ModelOut,
    SetApiKeyRequest,
    SetDefaultModelRequest,
    TestConnectionRequest,
    TestConnectionResult,
)

router = APIRouter(prefix="/api/models", tags=["Modelos IA"])

VALID_PROVIDERS = {
    "openai", "gemini", "claude", "groq", "openrouter", "mistral", "deepseek", "azure", "ollama",
}

# Catálogo de modelos por proveedor. Es información de referencia (qué
# modelos ofrece cada proveedor hoy), no una llamada a ningún backend de IA;
# se usa para poblar el selector de "modelo por defecto" en la UI.
MODEL_CATALOG: dict[str, dict] = {
    "openai": {
        "label": "OpenAI",
        "requires_api_key": True,
        "models": [
            {"id": "gpt-4o", "label": "GPT-4o"},
            {"id": "gpt-4.1", "label": "GPT-4.1"},
            {"id": "gpt-4.1-mini", "label": "GPT-4.1 Mini"},
            {"id": "gpt-5", "label": "GPT-5"},
            {"id": "gpt-5-mini", "label": "GPT-5 Mini"},
            {"id": "gpt-5-nano", "label": "GPT-5 Nano"},
        ],
    },
    "gemini": {
        "label": "Google Gemini",
        "requires_api_key": True,
        "models": [
            {"id": "gemini-2.5-flash", "label": "Gemini 2.5 Flash"},
            {"id": "gemini-2.5-pro", "label": "Gemini 2.5 Pro"},
        ],
    },
    "claude": {
        "label": "Anthropic Claude",
        "requires_api_key": True,
        "models": [
            {"id": "claude-3-5-sonnet-20241022", "label": "Claude Sonnet"},
            {"id": "claude-3-opus-20240229", "label": "Claude Opus"},
        ],
    },
    "groq": {
        "label": "Groq",
        "requires_api_key": True,
        "models": [
            {"id": "llama3-70b-8192", "label": "Llama 3"},
            {"id": "mixtral-8x7b-32768", "label": "Mixtral"},
        ],
    },
    "deepseek": {
        "label": "DeepSeek",
        "requires_api_key": True,
        "models": [
            {"id": "deepseek-r1", "label": "R1"},
            {"id": "deepseek-v3", "label": "V3"},
        ],
    },
    "mistral": {
        "label": "Mistral",
        "requires_api_key": True,
        "models": [
            {"id": "mistral-large", "label": "Large"},
            {"id": "mistral-small", "label": "Small"},
        ],
    },
    "openrouter": {
        "label": "OpenRouter",
        "requires_api_key": True,
        "models": [
            {"id": "openrouter/auto", "label": "Modelos disponibles (auto-routing)"},
        ],
    },
    "azure": {
        "label": "Azure OpenAI",
        "requires_api_key": True,
        "models": [
            {"id": "gpt-4o", "label": "GPT-4o (despliegue Azure)"},
        ],
    },
    "ollama": {
        "label": "Ollama (local)",
        "requires_api_key": False,
        "models": [
            {"id": "llama3", "label": "Llama 3 (local)"},
        ],
    },
}

# Endpoints reales usados por "Probar conexión": una llamada ligera y de
# solo lectura (listar modelos) que valida que la API key funciona, sin
# gastar tokens de generación. El "style" indica cómo se envía la key.
_TEST_ENDPOINTS = {
    "openai": ("https://api.openai.com/v1/models", "bearer"),
    "groq": ("https://api.groq.com/openai/v1/models", "bearer"),
    "openrouter": ("https://openrouter.ai/api/v1/models", "bearer"),
    "mistral": ("https://api.mistral.ai/v1/models", "bearer"),
    "deepseek": ("https://api.deepseek.com/v1/models", "bearer"),
    "claude": ("https://api.anthropic.com/v1/models", "anthropic"),
    "gemini": ("https://generativelanguage.googleapis.com/v1beta/models", "query_key"),
}


def _mask(key: str) -> str:
    if len(key) <= 4:
        return "•" * len(key)
    return f"{'•' * (len(key) - 4)}{key[-4:]}"


@router.get("", response_model=list[ModelOut])
def list_models(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ApiKeyRecord).order_by(ApiKeyRecord.provider).all()


@router.get("/catalog", response_model=list[ModelCatalogOut])
def get_catalog(current_user: User = Depends(get_current_user)):
    return [
        {"provider": provider, **meta} for provider, meta in MODEL_CATALOG.items()
    ]


@router.get("/active")
def get_active_model(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    setting = db.query(AppSetting).filter(AppSetting.key == "active_model").first()
    return {"active_model": setting.value if setting else "corpia-local"}


@router.post("/activate")
def activate_model(
    payload: ActivateModelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.provider not in VALID_PROVIDERS and payload.provider != "corpia-local":
        raise HTTPException(status_code=400, detail="Proveedor no reconocido")

    for record in db.query(ApiKeyRecord).all():
        record.is_active = record.provider == payload.provider

    setting = db.query(AppSetting).filter(AppSetting.key == "active_model").first()
    if setting:
        setting.value = payload.provider
    else:
        db.add(AppSetting(key="active_model", value=payload.provider))

    db.commit()
    return {"detail": f"Modelo activo actualizado a {payload.provider}"}


@router.post("/api-key")
def set_api_key(
    payload: SetApiKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.provider not in VALID_PROVIDERS:
        raise HTTPException(status_code=400, detail="Proveedor no reconocido")

    record = db.query(ApiKeyRecord).filter(ApiKeyRecord.provider == payload.provider).first()
    if not record:
        record = ApiKeyRecord(provider=payload.provider)
        db.add(record)

    record.key_encrypted = payload.api_key  # en producción: cifrar con Fernet/KMS
    record.key_masked = _mask(payload.api_key)
    record.last_validation_status = None
    record.last_validated_at = None
    record.updated_at = datetime.utcnow()
    db.commit()
    return {"detail": "API key guardada correctamente"}


@router.delete("/api-key/{provider}")
def delete_api_key(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    record = db.query(ApiKeyRecord).filter(ApiKeyRecord.provider == provider).first()
    if not record:
        raise HTTPException(status_code=404, detail="No hay API key configurada para ese proveedor")
    record.key_encrypted = ""
    record.key_masked = "Sin configurar"
    record.is_active = False
    record.default_model = None
    record.last_validation_status = None
    record.last_validated_at = None
    db.commit()
    return {"detail": "API key eliminada correctamente"}


@router.put("/default-model")
def set_default_model(
    payload: SetDefaultModelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    record = db.query(ApiKeyRecord).filter(ApiKeyRecord.provider == payload.provider).first()
    if not record:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    record.default_model = payload.model
    db.commit()
    return {"detail": "Modelo por defecto actualizado"}


@router.post("/test-connection", response_model=TestConnectionResult)
def test_connection(
    payload: TestConnectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Valida una API key con una llamada real y ligera (listar modelos) al
    proveedor correspondiente. No genera texto ni consume cuota de
    inferencia."""
    record = db.query(ApiKeyRecord).filter(ApiKeyRecord.provider == payload.provider).first()
    now = datetime.utcnow()

    if payload.provider == "ollama":
        status_, detail = "ok", "Ollama es un motor local: no requiere validación remota."
    elif not record or not record.key_encrypted:
        raise HTTPException(status_code=400, detail="Configura una API key antes de probar la conexión")
    elif payload.provider not in _TEST_ENDPOINTS:
        status_, detail = (
            "error",
            f"CorpIA todavía no implementa la validación automática para '{payload.provider}'. "
            "La key se guardó, pero no se pudo verificar.",
        )
    else:
        url, auth_style = _TEST_ENDPOINTS[payload.provider]
        try:
            if auth_style == "bearer":
                resp = httpx.get(
                    url, headers={"Authorization": f"Bearer {record.key_encrypted}"}, timeout=10
                )
            elif auth_style == "anthropic":
                resp = httpx.get(
                    url,
                    headers={
                        "x-api-key": record.key_encrypted,
                        "anthropic-version": "2023-06-01",
                    },
                    timeout=10,
                )
            elif auth_style == "query_key":
                resp = httpx.get(url, params={"key": record.key_encrypted}, timeout=10)
            else:
                raise ValueError(f"Estilo de autenticación no soportado: {auth_style}")

            if resp.status_code == 200:
                status_, detail = "ok", "Conexión validada correctamente."
            elif resp.status_code in (401, 403):
                status_, detail = "error", f"La API key fue rechazada ({resp.status_code})."
            else:
                status_, detail = "error", f"El proveedor respondió con estado {resp.status_code}."
        except httpx.RequestError as exc:
            status_, detail = "error", f"No se pudo contactar al proveedor: {exc}"

    record.last_validated_at = now
    record.last_validation_status = status_
    record.last_validation_detail = detail
    db.commit()

    return TestConnectionResult(
        provider=payload.provider, status=status_, detail=detail, validated_at=now
    )
