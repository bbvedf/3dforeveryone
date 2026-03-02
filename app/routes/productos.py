from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Producto, Categoria
from app.schemas import ProductoCreate, ProductoUpdate, Producto as ProductoSchema
from app.security import require_admin

router = APIRouter(prefix="/productos", tags=["productos"])


# ── Públicos ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ProductoSchema])
def listar_productos(
    skip: int = 0,
    limit: int = 20,
    categoria_id: int = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar productos con filtros opcionales (público)"""
    query = db.query(Producto)

    if activo is not None:
        query = query.filter(Producto.activo == activo)

    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)

    return query.offset(skip).limit(limit).all()


@router.get("/{producto_id}", response_model=ProductoSchema)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener un producto por ID (público)"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


# ── Solo admin ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=ProductoSchema, dependencies=[Depends(require_admin)])
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo producto (solo admin)"""
    categoria = db.query(Categoria).filter(Categoria.id == producto.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    db_producto = Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.put("/{producto_id}", response_model=ProductoSchema, dependencies=[Depends(require_admin)])
def actualizar_producto(
    producto_id: int, producto: ProductoUpdate, db: Session = Depends(get_db)
):
    """Actualizar un producto (solo admin)"""
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    for campo, valor in producto.model_dump(exclude_unset=True).items():
        setattr(db_producto, campo, valor)

    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.delete("/{producto_id}", dependencies=[Depends(require_admin)])
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    """Desactivar un producto (solo admin) — eliminación lógica"""
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db_producto.activo = False
    db.commit()
    return {"mensaje": "Producto desactivado exitosamente"}