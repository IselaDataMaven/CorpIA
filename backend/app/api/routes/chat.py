import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import Conversation, Message, User
from app.schemas.chat import (
    ChatRequest,
    ConversationDetailOut,
    ConversationOut,
    ConversationRenameRequest,
    MessageOut,
)
from app.services.chat_service import stream_chat_response

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("")
def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Envía una pregunta al asistente. Responde con streaming Server-Sent
    Events: primero un evento `meta` con conversation_id y referencias de
    documentos, luego eventos `token` con el texto de la respuesta, y un
    evento final `done`."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    return StreamingResponse(
        stream_chat_response(db, current_user.id, payload.message, payload.conversation_id),
        media_type="text/event-stream",
    )


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    detail = ConversationDetailOut.model_validate(conv)
    detail.messages = [
        MessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            references=json.loads(m.references_json) if m.references_json else [],
            created_at=m.created_at,
        )
        for m in messages
    ]
    return detail


@router.put("/conversations/{conversation_id}", response_model=ConversationOut)
def rename_conversation(
    conversation_id: str,
    payload: ConversationRenameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="El título no puede estar vacío")
    conv.title = payload.title.strip()[:80]
    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    db.delete(conv)  # cascade="all, delete-orphan" también borra sus mensajes
    db.commit()
    return {"detail": "Conversación eliminada correctamente"}
