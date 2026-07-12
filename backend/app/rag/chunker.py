"""Chunker: divide texto largo en fragmentos solapados aptos para embeddings."""


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    """Divide `text` en fragmentos de `chunk_size` caracteres con `overlap`
    caracteres de solapamiento entre fragmentos consecutivos, respetando
    saltos de párrafo cuando es posible para no cortar frases a la mitad."""
    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + chunk_size, length)

        # Intenta cortar en el último salto de párrafo o punto dentro de la ventana
        if end < length:
            boundary = text.rfind("\n\n", start, end)
            if boundary == -1:
                boundary = text.rfind(". ", start, end)
            if boundary != -1 and boundary > start + (chunk_size // 3):
                end = boundary + 1

        fragment = text[start:end].strip()
        if fragment:
            chunks.append(fragment)

        if end >= length:
            break
        start = max(end - overlap, start + 1)

    return chunks
