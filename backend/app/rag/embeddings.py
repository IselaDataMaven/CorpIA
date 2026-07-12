"""Embeddings: convierte texto en vectores numéricos.

Usa HashingVectorizer (bag-of-words hasheado con n-gramas + normalización L2).
Es determinista y sin estado -> no requiere "fit" previo, así que documentos
nuevos se pueden vectorizar de forma incremental sin re-procesar todo el
corpus, y no depende de ninguna API externa ni API key para funcionar.

Esta capa está aislada a propósito: para pasar a embeddings semánticos reales
(OpenAI, Gemini, etc.) solo hay que sustituir `embed_texts` por la llamada al
proveedor configurado en /api/models, sin tocar el resto del pipeline RAG.
"""
from sklearn.feature_extraction.text import HashingVectorizer

EMBEDDING_DIMENSIONS = 512

_vectorizer = HashingVectorizer(
    n_features=EMBEDDING_DIMENSIONS,
    ngram_range=(1, 2),
    alternate_sign=False,
    norm="l2",
)


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    matrix = _vectorizer.transform(texts)
    return matrix.toarray().tolist()


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
