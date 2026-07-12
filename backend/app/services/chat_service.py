import json
from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.models import ApiKeyRecord, AppSetting, Conversation, Message
from app.rag import pipeline
from app.rag.llm import stream_answer


def get_or_create_conversation(
    db: Session, user_id: str, conversation_id: str | None, first_message: str
) -> Conversation:
    if conversation_id:
        conv = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
            .first()
        )
        if conv:
            return conv

    title = first_message.strip()[:60] or "Nueva conversación"
    conv = Conversation(user_id=user_id, title=title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def get_active_provider(db: Session) -> tuple[str, str | None, str | None]:
    setting = db.query(AppSetting).filter(AppSetting.key == "active_model").first()
    provider = setting.value if setting else "corpia-local"

    if provider in ("corpia-local", "ollama"):
        return provider, None, None

    key_record = db.query(ApiKeyRecord).filter(ApiKeyRecord.provider == provider).first()
    api_key = key_record.key_encrypted if key_record and key_record.is_active else None
    model = key_record.default_model if key_record else None
    return provider, api_key, model


def stream_chat_response(
    db: Session, user_id: str, question: str, conversation_id: str | None
) -> Generator[str, None, None]:
    """Generador SSE: primero emite metadatos (conversation_id, referencias),
    luego el texto de la respuesta token a token, y guarda todo en la DB."""
    conversation = get_or_create_conversation(db, user_id, conversation_id, question)

    user_message = Message(conversation_id=conversation.id, role="user", content=question)
    db.add(user_message)
    db.commit()

    contexts = pipeline.retrieve_context(question)
    provider, api_key, model = get_active_provider(db)

    meta = {
        "type": "meta",
        "conversation_id": conversation.id,
        "references": [
            {
                "document_id": c["document_id"],
                "document_name": c["document_name"],
                "snippet": c["snippet"][:220],
                "score": c["score"],
            }
            for c in contexts
        ],
    }
    yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

    full_answer = ""
    for token in stream_answer(question, contexts, provider, api_key, model):
        full_answer += token
        yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=full_answer.strip(),
        references_json=json.dumps(meta["references"], ensure_ascii=False),
        provider=provider,
    )
    db.add(assistant_message)
    db.commit()

    yield f"data: {json.dumps({'type': 'done'}, ensure_ascii=False)}\n\n"
