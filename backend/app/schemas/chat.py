from datetime import datetime
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class DocumentReference(BaseModel):
    document_id: str
    document_name: str
    snippet: str
    score: float


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    references: list[DocumentReference] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: str
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetailOut(ConversationOut):
    messages: list[MessageOut] = []


class ConversationRenameRequest(BaseModel):
    title: str
