"""Pipeline: orquesta el flujo completo de indexado y consulta RAG."""
from pathlib import Path

from app.core.config import settings
from app.rag import loader, vector_store
from app.rag.chunker import chunk_text
from app.rag.retriever import retrieve


def index_document(document_id: str, document_name: str, file_path: Path, extension: str) -> int:
    """Loader -> Chunker -> Embeddings -> Vector Store. Devuelve el nº de chunks indexados."""
    raw_text = loader.load_text(file_path, extension)
    chunks = chunk_text(
        raw_text, chunk_size=settings.CHUNK_SIZE, overlap=settings.CHUNK_OVERLAP
    )
    return vector_store.upsert_document_chunks(document_id, document_name, chunks)


def remove_document(document_id: str) -> None:
    vector_store.delete_document_chunks(document_id)


def retrieve_context(question: str, top_k: int | None = None) -> list[dict]:
    return retrieve(question, top_k=top_k)
