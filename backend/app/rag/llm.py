"""LLM: capa de generación de respuestas.

Modo local ("corpia-local"): genera una respuesta extractiva real, sin
depender de ninguna API externa ni key -> funciona out-of-the-box.

Modo proveedor externo: si hay una API key activa configurada en
/api/models, esta capa hace la llamada real de streaming al proveedor
correspondiente con el contexto recuperado por el RAG ya incluido en el
prompt. Se soportan tres "familias" de protocolo:

  - "openai_compatible": OpenAI, Groq, DeepSeek, Mistral, OpenRouter
    (todos exponen /chat/completions con el mismo formato de streaming).
  - "anthropic": Claude (formato de eventos propio de Anthropic).
  - "gemini": Google Gemini (streamGenerateContent con la key en query string).

Si la llamada falla (key inválida, sin red, error del proveedor, proveedor
sin endpoint soportado como Azure sin despliegue configurado) se hace
fallback automático al motor local para que el chat nunca se caiga, pero
el motivo del fallo se registra en el log del servidor para poder
diagnosticarlo (antes se perdía en un `except Exception: pass` silencioso).
"""
import json
import logging
import time
from collections.abc import Generator

import httpx

logger = logging.getLogger("corpia.llm")

DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "groq": "llama-3.1-70b-versatile",
    "deepseek": "deepseek-chat",
    "mistral": "mistral-small-latest",
    "openrouter": "openrouter/auto",
    "claude": "claude-3-5-sonnet-20241022",
    "gemini": "gemini-1.5-flash",
}

# Proveedores compatibles con el formato OpenAI (Chat Completions + SSE)
_OPENAI_COMPATIBLE = {
    "openai": "https://api.openai.com/v1/chat/completions",
    "groq": "https://api.groq.com/openai/v1/chat/completions",
    "deepseek": "https://api.deepseek.com/chat/completions",
    "mistral": "https://api.mistral.ai/v1/chat/completions",
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
}

SUPPORTED_PROVIDERS = set(_OPENAI_COMPATIBLE) | {"claude", "gemini"}


def stream_answer(
    question: str,
    contexts: list[dict],
    provider: str,
    api_key: str | None,
    model: str | None = None,
) -> Generator[str, None, None]:
    if provider in SUPPORTED_PROVIDERS and api_key:
        try:
            yield from _stream_from_provider(question, contexts, provider, api_key, model)
            return
        except Exception as exc:  # noqa: BLE001
            # Fallback automático al motor local: el chat nunca se cae, pero
            # el motivo queda registrado para poder depurarlo.
            logger.warning("Fallo generando respuesta con %s: %s", provider, exc)

    yield from _stream_local_extractive(question, contexts)


def _stream_from_provider(
    question: str,
    contexts: list[dict],
    provider: str,
    api_key: str,
    model: str | None,
) -> Generator[str, None, None]:
    from app.rag.prompt import build_prompt

    prompt = build_prompt(question, contexts)
    resolved_model = model or DEFAULT_MODELS.get(provider)

    if provider in _OPENAI_COMPATIBLE:
        yield from _stream_openai_compatible(prompt, provider, api_key, resolved_model)
    elif provider == "claude":
        yield from _stream_claude(prompt, api_key, resolved_model)
    elif provider == "gemini":
        yield from _stream_gemini(prompt, api_key, resolved_model)
    else:
        raise ValueError(f"Proveedor sin integración de generación: {provider}")


def _stream_openai_compatible(
    prompt: str, provider: str, api_key: str, model: str
) -> Generator[str, None, None]:
    url = _OPENAI_COMPATIBLE[provider]
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": True,
    }

    with httpx.stream("POST", url, headers=headers, json=payload, timeout=30) as resp:
        if resp.status_code >= 400:
            resp.read()
            raise RuntimeError(f"{provider} respondió {resp.status_code}: {resp.text[:300]}")
        for line in resp.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            data = line[len("data: "):]
            if data == "[DONE]":
                break
            try:
                chunk = json.loads(data)
                delta = chunk["choices"][0]["delta"].get("content")
            except (json.JSONDecodeError, KeyError, IndexError):
                continue
            if delta:
                yield delta


def _stream_claude(prompt: str, api_key: str, model: str) -> Generator[str, None, None]:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": model,
        "max_tokens": 1024,
        "stream": True,
        "messages": [{"role": "user", "content": prompt}],
    }

    with httpx.stream("POST", url, headers=headers, json=payload, timeout=30) as resp:
        if resp.status_code >= 400:
            resp.read()
            raise RuntimeError(f"Claude respondió {resp.status_code}: {resp.text[:300]}")
        for line in resp.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            data = line[len("data: "):]
            try:
                chunk = json.loads(data)
            except json.JSONDecodeError:
                continue
            if chunk.get("type") == "content_block_delta":
                delta_text = chunk.get("delta", {}).get("text")
                if delta_text:
                    yield delta_text
            elif chunk.get("type") == "message_stop":
                break


def _stream_gemini(prompt: str, api_key: str, model: str) -> Generator[str, None, None]:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent"
        f"?alt=sse&key={api_key}"
    )
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    with httpx.stream("POST", url, json=payload, timeout=30) as resp:
        if resp.status_code >= 400:
            resp.read()
            raise RuntimeError(f"Gemini respondió {resp.status_code}: {resp.text[:300]}")
        for line in resp.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            data = line[len("data: "):]
            try:
                chunk = json.loads(data)
                delta = chunk["candidates"][0]["content"]["parts"][0].get("text")
            except (json.JSONDecodeError, KeyError, IndexError):
                continue
            if delta:
                yield delta


def _stream_local_extractive(
    question: str, contexts: list[dict]
) -> Generator[str, None, None]:
    """Motor local: compone una respuesta real a partir de los fragmentos
    mejor rankeados por el retriever (extractive answering), citando la
    fuente. No es generativo libre, pero es una respuesta genuina basada en
    los documentos de la empresa, y no requiere ninguna API key."""
    if not contexts:
        answer = (
            "No encontré información relevante en la base de conocimiento para "
            "responder esta pregunta. Verifica que existan documentos indexados "
            "sobre este tema, o sube uno nuevo en 'Base de conocimiento'."
        )
    else:
        best = contexts[0]
        intro = f"Según **{best['document_name']}**, "
        body = best["snippet"].strip().replace("\n", " ")
        if len(body) > 500:
            body = body[:500].rsplit(" ", 1)[0] + "…"

        extra_sources = [c["document_name"] for c in contexts[1:3]]
        outro = ""
        if extra_sources:
            outro = "\n\nTambién encontré información relacionada en: " + ", ".join(
                f"*{name}*" for name in extra_sources
            )

        answer = f"{intro}{body}{outro}"

    for word in answer.split(" "):
        yield word + " "
        time.sleep(0.02)  # ritmo de streaming perceptible en el frontend
