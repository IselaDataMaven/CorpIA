from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import Document, User
from app.rag.vector_store import get_document_chunks
from app.schemas.document import DocumentOut, DocumentPreviewOut
from app.services.document_service import (
    FileTooLargeError,
    UnsupportedFileError,
    delete_document,
    reindex_document,
    save_and_index_document,
)

router = APIRouter(prefix="/api/documents", tags=["Documentos"])


@router.post("/upload", response_model=DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sube un documento (PDF, DOCX, PPTX, CSV, XLSX, JSON, TXT, HTML o
    Markdown) y lo indexa de inmediato en la base de conocimiento vectorial."""
    try:
        return save_and_index_document(db, file, current_user.id)
    except UnsupportedFileError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileTooLargeError as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc


@router.get("", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).order_by(Document.created_at.desc()).all()


@router.delete("/{document_id}")
def delete_document_endpoint(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    delete_document(db, document)
    return {"detail": "Documento eliminado correctamente"}


@router.post("/{document_id}/reindex", response_model=DocumentOut)
def reindex_document_endpoint(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return reindex_document(db, document)


@router.get("/{document_id}/preview", response_model=DocumentPreviewOut)
def preview_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    if document.status != "indexed":
        raise HTTPException(
            status_code=400,
            detail="El documento todavía no está indexado, no hay fragmentos que previsualizar.",
        )
    chunks = get_document_chunks(document_id, limit=5)
    return DocumentPreviewOut(
        document_id=document.id, document_name=document.original_name, chunks=chunks
    )
