import os
import uuid
import mimetypes
from typing import List

from fastapi import (APIRouter, Depends, HTTPException, UploadFile, File, status)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename

from app.database import get_db
from app.assurelog.models.test_case import TestCase
from app.assurelog.models.user import User
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/api/uploads",
    tags=["Uploads"]
)

UPLOAD_FOLDER = os.path.abspath(
    os.path.join(os.getcwd(), "uploads")
)

MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

ALLOWED_EXTENSIONS = {
    "png", "jpg", "jpeg", "gif", "bmp", "webp",
    "mp4", "avi", "mov", "wmv", "flv", "webm",
    "pdf", "doc", "docx", "txt", "rtf",
    "zip", "rar", "7z"
}


# =========================================================
# HELPERS
# =========================================================

def is_allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_file_size(file: UploadFile):
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Arquivo excede o tamanho máximo permitido (16MB)"
        )


# =========================================================
# UPLOAD
# =========================================================

@router.post("/{test_case_id}", status_code=status.HTTP_201_CREATED)
def upload_evidence(
    test_case_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test_case = db.query(TestCase).filter(TestCase.id == test_case_id).first()

    if not test_case:
        raise HTTPException(status_code=404, detail="Caso de teste não encontrado")

    report = test_case.report

    # 🔒 Controle de acesso
    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    if not is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido")

    validate_file_size(file)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_name)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # 🔗 Vincula ao TestCase
    evidence = test_case.evidence_files or []
    evidence.append({
        "filename": unique_name,
        "original_name": file.filename,
        "mime_type": file.content_type,
        "url": f"/api/uploads/{unique_name}"
    })
    test_case.evidence_files = evidence

    db.commit()
    db.refresh(test_case)

    return {
        "message": "Upload realizado com sucesso",
        "filename": unique_name,
        "url": f"/api/uploads/{unique_name}"
    }


# =========================================================
# DOWNLOAD
# =========================================================

@router.get("/{filename}")
def get_uploaded_file(
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    safe_filename = secure_filename(filename)
    file_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    test_case = (
        db.query(TestCase)
        .filter(TestCase.evidence_files.contains([{"filename": safe_filename}]))
        .first()
    )

    if not test_case:
        raise HTTPException(status_code=404, detail="Arquivo não vinculado a nenhum caso")

    report = test_case.report

    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    media_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

    return FileResponse(file_path, media_type=media_type)


# =========================================================
# DELETE
# =========================================================

@router.delete("/{filename}")
def delete_uploaded_file(
    filename: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    safe_filename = secure_filename(filename)
    file_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    test_case = (
        db.query(TestCase)
        .filter(TestCase.evidence_files.contains([{"filename": safe_filename}]))
        .first()
    )

    if not test_case:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    report = test_case.report

    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    if os.path.exists(file_path):
        os.remove(file_path)

    test_case.evidence_files = [
        f for f in test_case.evidence_files
        if f.get("filename") != safe_filename
    ]

    db.commit()

    return {"message": "Arquivo removido com sucesso"}
