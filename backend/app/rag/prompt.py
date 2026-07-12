"""Prompt: ensambla el prompt final que recibe el LLM, combinando la pregunta
del usuario con los fragmentos recuperados por el retriever."""

SYSTEM_PROMPT = (
    "Eres el asistente de conocimiento interno de la empresa (CorpIA). "
    "Respondes únicamente con base en los fragmentos de documentos "
    "proporcionados como contexto. Si el contexto no contiene la respuesta, "
    "dilo explícitamente en vez de inventar información."
)


def build_prompt(question: str, contexts: list[dict]) -> str:
    if not contexts:
        return (
            f"{SYSTEM_PROMPT}\n\n"
            f"No hay documentos indexados relevantes para esta pregunta.\n\n"
            f"Pregunta: {question}"
        )

    context_block = "\n\n".join(
        f"[Fuente {i+1} · {c['document_name']}]\n{c['snippet']}"
        for i, c in enumerate(contexts)
    )
    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"### Contexto recuperado\n{context_block}\n\n"
        f"### Pregunta\n{question}\n\n"
        f"### Respuesta (cita la fuente entre corchetes cuando corresponda)"
    )
