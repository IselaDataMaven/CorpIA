import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import Document
from app.rag import pipeline

ALLOWED_EXTENSIONS = {
    "pdf", "docx", "pptx", "csv", "xlsx", "json", "txt", "html", "htm", "md", "markdown",
}


class UnsupportedFileError(Exception):
    pass


class FileTooLargeError(Exception):
    pass


def save_and_index_document(db: Session, file: UploadFile, uploaded_by_id: str) -> Document:
    extension = Path(file.filename).suffix.lower().lstrip(".")
    if extension not in ALLOWED_EXTENSIONS:
        raise UnsupportedFileError(f"Extensión no soportada: .{extension}")

    stored_filename = f"{uuid.uuid4()}.{extension}"
    destination = settings.UPLOADS_DIR / stored_filename

    size_bytes = 0
    with destination.open("wb") as out_file:
        while chunk := file.file.read(1024 * 1024):
            size_bytes += len(chunk)
            if size_bytes > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                destination.unlink(missing_ok=True)
                raise FileTooLargeError(
                    f"El archivo supera el límite de {settings.MAX_UPLOAD_SIZE_MB} MB"
                )
            out_file.write(chunk)

    document = Document(
        original_name=file.filename,
        stored_filename=stored_filename,
        content_type=file.content_type or "application/octet-stream",
        extension=extension,
        size_bytes=size_bytes,
        status="indexing",
        uploaded_by_id=uploaded_by_id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        chunk_count = pipeline.index_document(
            document_id=document.id,
            document_name=document.original_name,
            file_path=destination,
            extension=extension,
        )
        document.status = "indexed"
        document.chunk_count = chunk_count
        from datetime import datetime

        document.indexed_at = datetime.utcnow()
    except Exception as exc:  # noqa: BLE001 - se guarda el error para mostrarlo en UI
        document.status = "error"
        document.error_message = str(exc)

    db.commit()
    db.refresh(document)
    return document


def reindex_document(db: Session, document: Document) -> Document:
    destination = settings.UPLOADS_DIR / document.stored_filename
    pipeline.remove_document(document.id)
    document.status = "indexing"
    document.error_message = None
    db.commit()

    try:
        chunk_count = pipeline.index_document(
            document_id=document.id,
            document_name=document.original_name,
            file_path=destination,
            extension=document.extension,
        )
        document.status = "indexed"
        document.chunk_count = chunk_count
        from datetime import datetime

        document.indexed_at = datetime.utcnow()
    except Exception as exc:  # noqa: BLE001
        document.status = "error"
        document.error_message = str(exc)

    db.commit()
    db.refresh(document)
    return document


def delete_document(db: Session, document: Document) -> None:
    pipeline.remove_document(document.id)
    destination = settings.UPLOADS_DIR / document.stored_filename
    destination.unlink(missing_ok=True)
    db.delete(document)
    db.commit()
