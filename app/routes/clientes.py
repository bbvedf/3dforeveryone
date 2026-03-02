from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import get_db
from app.models import Cliente
from app.schemas import ClienteCreate, ClienteUpdate, Cliente as ClienteSchema

router = APIRouter(prefix="/clientes", tags=["clientes"])

# Configurar hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


@router.get("/", response_model=list[ClienteSchema])
def listar_clientes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Listar clientes (solo admin)"""
    return db.query(Cliente).filter(Cliente.activo == True).offset(skip).limit(limit).all()


@router.get("/{cliente_id}", response_model=ClienteSchema)
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Obtener un cliente por ID"""
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.post("/registro", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
def registrar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo cliente"""
    # Verificar si el email ya existe
    email_existente = db.query(Cliente).filter(Cliente.email == cliente.email).first()
    if email_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear cliente con contraseña hasheada
    db_cliente = Cliente(
        email=cliente.email,
        nombre=cliente.nombre,
        apellido=cliente.apellido,
        telefono=cliente.telefono,
        direccion=cliente.direccion,
        ciudad=cliente.ciudad,
        codigo_postal=cliente.codigo_postal,
        pais=cliente.pais,
        contraseña_hash=hash_password(cliente.contraseña),
    )
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.put("/{cliente_id}", response_model=ClienteSchema)
def actualizar_cliente(
    cliente_id: int, cliente: ClienteUpdate, db: Session = Depends(get_db)
):
    """Actualizar datos de un cliente"""
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    datos_actualizacion = cliente.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizacion.items():
        setattr(db_cliente, campo, valor)
    
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.delete("/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Desactivar un cliente"""
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    db_cliente.activo = False
    db.commit()
    return {"mensaje": "Cliente desactivado exitosamente"}