from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Categoria
from app.schemas import CategoriaCreate, CategoriaUpdate, Categoria as CategoriaSchema

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("/", response_model=list[CategoriaSchema])
def listar_categorias(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Listar todas las categorías"""
    return db.query(Categoria).offset(skip).limit(limit).all()


@router.get("/{categoria_id}", response_model=CategoriaSchema)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Obtener una categoría por ID"""
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@router.post("/", response_model=CategoriaSchema)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    """Crear una nueva categoría"""
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.put("/{categoria_id}", response_model=CategoriaSchema)
def actualizar_categoria(
    categoria_id: int, categoria: CategoriaUpdate, db: Session = Depends(get_db)
):
    """Actualizar una categoría"""
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    datos_actualizacion = categoria.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizacion.items():
        setattr(db_categoria, campo, valor)
    
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """Eliminar una categoría"""
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db.delete(db_categoria)
    db.commit()
    return {"mensaje": "Categoría eliminada exitosamente"}