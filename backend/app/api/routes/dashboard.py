from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import AppSetting, Conversation, Document, Message, User
from app.rag.vector_store import get_collection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

WEEKDAY_LABELS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]


@router.get("")
def get_dashboard_metrics(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    total_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_documents = db.query(Document).count()
    total_queries = db.query(Message).filter(Message.role == "user").count()

    active_model_setting = db.query(AppSetting).filter(AppSetting.key == "active_model").first()
    active_model = active_model_setting.value if active_model_setting else "corpia-local"

    since = datetime.utcnow() - timedelta(days=7)
    recent_user_messages = (
        db.query(Message)
        .filter(Message.role == "user", Message.created_at >= since)
        .all()
    )
    counts_by_weekday = defaultdict(int)
    for m in recent_user_messages:
        counts_by_weekday[m.created_at.weekday()] += 1
    weekly_series = [
        {"day": WEEKDAY_LABELS_ES[i], "consultas": counts_by_weekday.get(i, 0)}
        for i in range(7)
    ]

    indexed_docs = db.query(Document).filter(Document.status == "indexed").count()

    last_questions = (
        db.query(Message)
        .filter(Message.role == "user")
        .order_by(Message.created_at.desc())
        .limit(5)
        .all()
    )

    recent_documents = (
        db.query(Document).order_by(Document.created_at.desc()).limit(5).all()
    )

    recent_conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .limit(5)
        .all()
    )

    provider_rows = (
        db.query(Message.provider)
        .filter(Message.role == "assistant", Message.provider.isnot(None))
        .all()
    )
    usage_by_provider_map = defaultdict(int)
    for (provider,) in provider_rows:
        usage_by_provider_map[provider] += 1
    usage_by_provider = [
        {"provider": provider, "count": count} for provider, count in usage_by_provider_map.items()
    ]

    return {
        "users": total_users,
        "queries": total_queries,
        "documents": total_documents,
        "active_model": active_model,
        "server_status": "online",
        "vector_store_chunks": get_collection().count(),
        "indexed_documents": f"{indexed_docs} / {total_documents}",
        "weekly_queries": weekly_series,
        "last_questions": [m.content for m in last_questions],
        "recent_documents": [
            {
                "id": d.id,
                "name": d.original_name,
                "status": d.status,
                "created_at": d.created_at.isoformat(),
            }
            for d in recent_documents
        ],
        "recent_conversations": [
            {"id": c.id, "title": c.title, "created_at": c.created_at.isoformat()}
            for c in recent_conversations
        ],
        "usage_by_provider": usage_by_provider,
    }
