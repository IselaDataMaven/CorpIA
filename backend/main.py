from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    auth,
    chat,
    dashboard,
    documents,
    models,
    settings as settings_routes,
    system,
    users,
)
from app.core.config import settings
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "API REST de CorpIA — Enterprise AI Knowledge Assistant. "
        "Expone autenticación, chat con RAG, gestión de documentos, "
        "modelos IA, usuarios y configuración. Documentación interactiva "
        "disponible en /docs (Swagger UI) y /redoc."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(models.router)
app.include_router(users.router)
app.include_router(settings_routes.router)
app.include_router(dashboard.router)
app.include_router(system.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
