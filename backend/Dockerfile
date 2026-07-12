# CorpIA Backend — FastAPI + RAG
FROM python:3.12-slim AS base

# hnswlib (dependencia de ChromaDB) necesita compilar extensiones nativas.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# El volumen de datos (SQLite, ChromaDB, uploads) se monta en /app/data
# desde docker-compose.yml para persistir entre reinicios del contenedor.
RUN mkdir -p /app/data/uploads /app/data/chroma

ENV ANONYMIZED_TELEMETRY=False \
    PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
