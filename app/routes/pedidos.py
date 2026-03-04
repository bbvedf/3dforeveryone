from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Pedido, ItemPedido, Producto, Cliente, EstadoPedido, RolUsuario
from app.schemas import PedidoCreate, PedidoUpdate, PedidoResponse
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def generar_numero_pedido(db: Session) -> str:
    contador = db.query(Pedido).count() + 1
    fecha = datetime.utcnow().strftime("%Y%m%d")
    return f"PED-{fecha}-{contador:05d}"


# ── Login requerido ────────────────────────────────────────────────────────────

@router.get("/", response_model=list[PedidoResponse])
def listar_pedidos(
    skip: int = 0,
    limit: int = 100,
    estado: str = None,
    search: str = None,
    order_by: str = "creado_en",
    order_dir: str = "desc",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar pedidos. Admin ve todos; cliente solo los suyos."""
    query = db.query(Pedido).outerjoin(Cliente)

    if current_user.rol != RolUsuario.ADMIN:
        query = query.filter(Pedido.cliente_id == current_user.id)

    if estado:
        query = query.filter(Pedido.estado == estado)

    if search:
        termino = func.unaccent(f"%{search}%")
        query = query.filter(
            (func.unaccent(Pedido.numero_pedido).ilike(termino)) |
            (func.unaccent(Cliente.nombre).ilike(termino)) |
            (func.unaccent(Cliente.apellido).ilike(termino)) |
            (func.concat(func.unaccent(Cliente.nombre), ' ', func.unaccent(Cliente.apellido)).ilike(termino)) |
            (func.unaccent(Cliente.email).ilike(termino))
        )

    if order_by == "cliente":
        columna = Cliente.nombre
    elif order_by == "fecha":
        columna = Pedido.creado_en
    else:
        columna = getattr(Pedido, order_by, Pedido.creado_en)

    if order_dir == "desc":
        query = query.order_by(columna.desc())
    else:
        query = query.order_by(columna.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/{pedido_id}", response_model=PedidoResponse)
def obtener_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener un pedido por ID (propio o admin)"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if current_user.rol != RolUsuario.ADMIN and pedido.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este pedido")

    return pedido


@router.post("/", response_model=PedidoResponse)
def crear_pedido(
    pedido_data: PedidoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Crear un nuevo pedido (el cliente_id viene del token JWT)"""
    if not pedido_data.items:
        raise HTTPException(status_code=400, detail="El pedido debe tener al menos un item")

    total = 0
    items_pedido = []

    for item_data in pedido_data.items:
        producto = db.query(Producto).filter(Producto.id == item_data.producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item_data.producto_id} no encontrado",
            )
        if producto.stock < item_data.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})",
            )

        subtotal = producto.precio * item_data.cantidad
        total += subtotal

        items_pedido.append(
            ItemPedido(
                producto_id=item_data.producto_id,
                cantidad=item_data.cantidad,
                precio_unitario=producto.precio,
                subtotal=subtotal,
            )
        )
        producto.stock -= item_data.cantidad

    db_pedido = Pedido(
        cliente_id=current_user.id,  # ← viene del JWT, no de query param
        numero_pedido=generar_numero_pedido(db),
        estado=EstadoPedido.PENDIENTE,
        total=total,
        direccion_envio=pedido_data.direccion_envio,
        notas=pedido_data.notas,
    )
    db_pedido.items = items_pedido
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)
    return db_pedido


@router.post("/{pedido_id}/cancelar")
def cancelar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Cancelar un pedido (propio o admin). Devuelve stock."""
    db_pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if current_user.rol != RolUsuario.ADMIN and db_pedido.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para cancelar este pedido")

    if db_pedido.estado == EstadoPedido.CANCELADO:
        raise HTTPException(status_code=400, detail="El pedido ya está cancelado")

    for item in db_pedido.items:
        item.producto.stock += item.cantidad

    db_pedido.estado = EstadoPedido.CANCELADO
    db_pedido.actualizado_en = datetime.utcnow()
    db.commit()

    return {"mensaje": "Pedido cancelado y stock devuelto exitosamente"}


# ── Solo admin ─────────────────────────────────────────────────────────────────

@router.put("/{pedido_id}", response_model=PedidoResponse, dependencies=[Depends(require_admin)])
def actualizar_pedido(
    pedido_id: int,
    pedido_data: PedidoUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar estado o notas de un pedido (solo admin)"""
    db_pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    for campo, valor in pedido_data.model_dump(exclude_unset=True).items():
        setattr(db_pedido, campo, valor)

    db_pedido.actualizado_en = datetime.utcnow()
    db.commit()
    db.refresh(db_pedido)
    return db_pedido