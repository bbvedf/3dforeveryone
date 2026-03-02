from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Producto, Categoria
from app.schemas import ProductoCreate, ProductoUpdate, Producto as ProductoSchema

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("/", response_model=list[ProductoSchema])
def listar_productos(
    skip: int = 0,
    limit: int = 10,
    categoria_id: int = None,
    activo: bool = True,
    db: Session = Depends(get_db),
):
    """Listar productos con filtros opcionales"""
    query = db.query(Producto)
    
    if activo is not None:
        query = query.filter(Producto.activo == activo)
    
    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{producto_id}", response_model=ProductoSchema)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener un producto por ID"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoSchema)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo producto"""
    # Validar que la categoría existe
    categoria = db.query(Categoria).filter(Categoria.id == producto.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db_producto = Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.put("/{producto_id}", response_model=ProductoSchema)
def actualizar_producto(
    producto_id: int, producto: ProductoUpdate, db: Session = Depends(get_db)
):
    """Actualizar un producto"""
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    datos_actualizacion = producto.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizacion.items():
        setattr(db_producto, campo, valor)
    
    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.delete("/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    """Eliminar un producto (lógico)"""
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Eliminación lógica
    db_producto.activo = False
    db.commit()
    return {"mensaje": "Producto desactivado exitosamente"}