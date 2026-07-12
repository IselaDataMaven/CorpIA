"""Retriever: capa fina sobre el vector store, punto único de acceso para el
resto de la app. Si mañana se cambia ChromaDB por otro vector store, solo se
edita este archivo."""
from app.core.config import settings
from app.rag import vector_store


def retrieve(query_text: str, top_k: int | None = None) -> list[dict]:
    k = top_k or settings.TOP_K_RESULTS
    return vector_store.query(query_text, top_k=k)
