from datetime import datetime
from pydantic import BaseModel


class ModelOut(BaseModel):
    provider: str
    key_masked: str
    default_model: str | None = None
    is_active: bool
    last_validated_at: datetime | None = None
    last_validation_status: str | None = None
    last_validation_detail: str | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class ActivateModelRequest(BaseModel):
    provider: str


class SetApiKeyRequest(BaseModel):
    provider: str
    api_key: str


class SetDefaultModelRequest(BaseModel):
    provider: str
    model: str


class TestConnectionRequest(BaseModel):
    provider: str


class TestConnectionResult(BaseModel):
    provider: str
    status: str  # ok | error
    detail: str
    validated_at: datetime


class ModelCatalogEntry(BaseModel):
    id: str
    label: str


class ModelCatalogOut(BaseModel):
    provider: str
    label: str
    requires_api_key: bool
    models: list[ModelCatalogEntry]
