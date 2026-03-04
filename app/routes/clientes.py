from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cliente, RolUsuario
from app.schemas import ClienteCreate, ClienteUpdate, Cliente as ClienteSchema
from app.security import get_current_user, require_admin, hash_password

router = APIRouter(prefix="/clientes", tags=["clientes"])


# ── Público ────────────────────────────────────────────────────────────────────

@router.post("/registro", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
def registrar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo cliente (público)"""
    if db.query(Cliente).filter(Cliente.email == cliente.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )

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
        rol=RolUsuario.CLIENTE,
    )
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


# ── Login requerido ────────────────────────────────────────────────────────────

@router.get("/me", response_model=ClienteSchema)
def obtener_perfil_actual(current_user: Cliente = Depends(get_current_user)):
    """Obtener el perfil del usuario logueado actualmente"""
    return current_user


@router.get("/{cliente_id}", response_model=ClienteSchema)
def obtener_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener cliente por ID (propio o admin)"""
    if current_user.rol != RolUsuario.ADMIN and current_user.id != cliente_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este cliente")

    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.put("/{cliente_id}", response_model=ClienteSchema)
def actualizar_cliente(
    cliente_id: int,
    cliente: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Actualizar datos de cliente (propio o admin)"""
    if current_user.rol != RolUsuario.ADMIN and current_user.id != cliente_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar este cliente")

    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    for campo, valor in cliente.model_dump(exclude_unset=True).items():
        if campo == "contraseña" and valor:
            db_cliente.contraseña_hash = hash_password(valor)
        else:
            setattr(db_cliente, campo, valor)

    db.commit()
    db.refresh(db_cliente)
    return db_cliente


# ── Solo admin ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ClienteSchema], dependencies=[Depends(require_admin)])
def listar_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todos los clientes activos e inactivos (solo admin)"""
    return db.query(Cliente).offset(skip).limit(limit).all()


@router.delete("/{cliente_id}", dependencies=[Depends(require_admin)])
def desactivar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Desactivar un cliente (solo admin) - soft delete"""
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if db_cliente.rol == RolUsuario.ADMIN:
        raise HTTPException(status_code=403, detail="No se puede desactivar a un administrador")

    db_cliente.activo = False
    db.commit()
    return {"mensaje": "Cliente desactivado exitosamente"}


@router.delete("/{cliente_id}/eliminar", dependencies=[Depends(require_admin)])
def eliminar_cliente_definitivo(cliente_id: int, db: Session = Depends(get_db)):
    """Eliminar permanentemente un cliente de la BD (solo admin, solo si ya inactivo)"""
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if db_cliente.rol == RolUsuario.ADMIN:
        raise HTTPException(status_code=403, detail="No se puede eliminar a un administrador")
    if db_cliente.activo:
        raise HTTPException(status_code=400, detail="Desactiva primero al cliente antes de eliminarlo")

    db.delete(db_cliente)
    db.commit()
    return {"mensaje": "Cliente eliminado permanentemente"}