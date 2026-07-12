from datetime import datetime
from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    original_name: str
    extension: str
    size_bytes: int
    status: str
    chunk_count: int
    error_message: str | None = None
    created_at: datetime
    indexed_at: datetime | None = None

    model_config = {"from_attributes": True}


class DocumentPreviewOut(BaseModel):
    document_id: str
    document_name: str
    chunks: list[str]
