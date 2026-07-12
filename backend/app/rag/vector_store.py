"""Vector Store: persistencia y búsqueda de fragmentos embebidos usando ChromaDB."""
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings
from app.rag.embeddings import embed_query, embed_texts

_client = chromadb.PersistentClient(
    path=str(settings.CHROMA_DIR),
    settings=ChromaSettings(anonymized_telemetry=False),
)
_COLLECTION_NAME = "corpia_documents"


def get_collection():
    return _client.get_or_create_collection(
        name=_COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )


def upsert_document_chunks(
    document_id: str, document_name: str, chunks: list[str]
) -> int:
    """Embebe y guarda los fragmentos de un documento. Devuelve cuántos se indexaron."""
    if not chunks:
        return 0

    collection = get_collection()
    embeddings = embed_texts(chunks)
    ids = [f"{document_id}::{i}" for i in range(len(chunks))]
    metadatas = [
        {"document_id": document_id, "document_name": document_name, "chunk_index": i}
        for i in range(len(chunks))
    ]

    collection.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
    return len(chunks)


def delete_document_chunks(document_id: str) -> None:
    collection = get_collection()
    collection.delete(where={"document_id": document_id})


def get_document_chunks(document_id: str, limit: int = 5) -> list[str]:
    collection = get_collection()
    result = collection.get(where={"document_id": document_id}, limit=limit)
    return result.get("documents", []) or []


def query(text: str, top_k: int = 4) -> list[dict]:
    collection = get_collection()
    if collection.count() == 0:
        return []

    query_embedding = embed_query(text)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
    )

    hits = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for doc_text, meta, distance in zip(docs, metas, distances):
        similarity = max(0.0, 1 - distance)  # distancia coseno -> similitud
        hits.append(
            {
                "document_id": meta["document_id"],
                "document_name": meta["document_name"],
                "snippet": doc_text,
                "score": round(similarity, 4),
            }
        )
    return hits
