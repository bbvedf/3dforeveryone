from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Categoria, Producto
from app.schemas import CategoriaCreate, CategoriaUpdate, Categoria as CategoriaSchema
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/categorias", tags=["categorías"])


# ── Públicos ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[CategoriaSchema])
def listar_categorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todas las categorías (público)"""
    return db.query(Categoria).filter(Categoria.activa == True).order_by(func.lower(Categoria.nombre)).offset(skip).limit(limit).all()

@router.get("/admin", response_model=list[CategoriaSchema], dependencies=[Depends(require_admin)])
def listar_categorias_admin(db: Session = Depends(get_db)):
    """Listar todas las categorías incluyendo inactivas (solo admin)"""
    return db.query(Categoria).order_by(func.lower(Categoria.nombre)).all()


@router.get("/{categoria_id}", response_model=CategoriaSchema)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Obtener una categoría por ID (público)"""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


# ── Solo admin ─────────────────────────────────────────────────────────────────




@router.post("/", response_model=CategoriaSchema, dependencies=[Depends(require_admin)])
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    """Crear una nueva categoría (solo admin)"""
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.put("/{categoria_id}", response_model=CategoriaSchema, dependencies=[Depends(require_admin)])
def actualizar_categoria(
    categoria_id: int, categoria: CategoriaUpdate, db: Session = Depends(get_db)
):
    """Actualizar una categoría (solo admin)"""
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    for campo, valor in categoria.model_dump(exclude_unset=True).items():
        setattr(db_categoria, campo, valor)

    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.delete("/{categoria_id}", dependencies=[Depends(require_admin)])
def desactivar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Desactivar una categoría (solo admin) — eliminación lógica"""
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    db_categoria.activa = False
    db.commit()
    return {"mensaje": "Categoría ocultada exitosamente"}


@router.delete("/{categoria_id}/eliminar", dependencies=[Depends(require_admin)])
def eliminar_categoria_permanente(categoria_id: int, db: Session = Depends(get_db)):
    """Eliminar permanentemente una categoría (solo admin) — Hard Delete"""
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Comprobar si tiene productos asociados
    tiene_productos = db.query(Producto).filter(Producto.categoria_id == categoria_id).first()
    if tiene_productos:
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar una categoría que tiene productos asociados. Primero mueve o elimina los productos."
        )

    db.delete(db_categoria)
    db.commit()
    return {"mensaje": "Categoría eliminada permanentemente de la base de datos"}