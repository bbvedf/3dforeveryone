import os
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Producto, Cliente
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/uploads", tags=["uploads"])

# ── Configuración ──────────────────────────────────────────────────────────────
UPLOAD_DIR = Path("/app/uploads")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 5
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024


def _ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def _validate_image(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, WEBP, GIF"
        )


def _save_file(file: UploadFile, folder: str, filename: str) -> str:
    """Guarda el archivo y devuelve la URL relativa pública."""
    dest_dir = UPLOAD_DIR / folder
    _ensure_dir(dest_dir)

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    safe_name = f"{filename}.{ext}"
    dest_path = dest_dir / safe_name

    with dest_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/{folder}/{safe_name}"


def _delete_file(url: str):
    """Elimina el archivo físico dado su URL relativa."""
    if url:
        file_path = UPLOAD_DIR / url.replace("/uploads/", "", 1)
        if file_path.exists():
            file_path.unlink()


# ── Productos (admin only) ─────────────────────────────────────────────────────

@router.post("/producto/{producto_id}", dependencies=[Depends(require_admin)])
async def subir_imagen_producto(
    producto_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Subir o reemplazar la imagen principal de un producto (solo admin)"""
    _validate_image(file)

    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Eliminar imagen anterior si existe
    if producto.imagen_url:
        _delete_file(producto.imagen_url)

    # Añadimos un hash aleatorio al nombre para evitar caché del navegador
    unique_suffix = uuid.uuid4().hex[:6]
    url = _save_file(file, "productos", f"{producto_id}_{unique_suffix}")
    producto.imagen_url = url
    db.commit()

    return {"imagen_url": url, "mensaje": "Imagen subida correctamente"}


@router.delete("/producto/{producto_id}", dependencies=[Depends(require_admin)])
def eliminar_imagen_producto(producto_id: int, db: Session = Depends(get_db)):
    """Eliminar la imagen de un producto (solo admin)"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if producto.imagen_url:
        _delete_file(producto.imagen_url)
        producto.imagen_url = None
        db.commit()

    return {"mensaje": "Imagen eliminada"}


# ── Avatares (usuario propio) ──────────────────────────────────────────────────

@router.post("/avatar")
async def subir_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Subir o reemplazar el avatar del usuario autenticado"""
    _validate_image(file)

    # Eliminar avatar anterior
    if current_user.avatar_url:
        _delete_file(current_user.avatar_url)

    url = _save_file(file, "avatares", f"{current_user.id}_{uuid.uuid4().hex[:8]}")
    current_user.avatar_url = url
    db.commit()

    return {"avatar_url": url, "mensaje": "Avatar actualizado correctamente"}


@router.delete("/avatar")
def eliminar_avatar(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Resetear avatar al icono por defecto"""
    cliente = db.query(Cliente).filter(Cliente.id == current_user.id).first()
    if cliente and cliente.avatar_url:
        _delete_file(cliente.avatar_url)
        cliente.avatar_url = None
        db.commit()

    return {"mensaje": "Avatar eliminado, se usará el avatar por defecto"}
