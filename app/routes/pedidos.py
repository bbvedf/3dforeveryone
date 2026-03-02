from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Pedido, ItemPedido, Producto, Cliente, EstadoPedido
from app.schemas import PedidoCreate, PedidoUpdate, PedidoResponse

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def generar_numero_pedido(db: Session) -> str:
    """Generar número de pedido único"""
    contador = db.query(Pedido).count() + 1
    fecha = datetime.utcnow().strftime("%Y%m%d")
    return f"PED-{fecha}-{contador:05d}"


@router.get("/", response_model=list[PedidoResponse])
def listar_pedidos(
    skip: int = 0,
    limit: int = 10,
    cliente_id: int = None,
    estado: str = None,
    db: Session = Depends(get_db),
):
    """Listar pedidos con filtros opcionales"""
    query = db.query(Pedido)
    
    if cliente_id:
        query = query.filter(Pedido.cliente_id == cliente_id)
    
    if estado:
        query = query.filter(Pedido.estado == estado)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{pedido_id}", response_model=PedidoResponse)
def obtener_pedido(pedido_id: int, db: Session = Depends(get_db)):
    """Obtener un pedido por ID"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.post("/", response_model=PedidoResponse)
def crear_pedido(pedido_data: PedidoCreate, cliente_id: int, db: Session = Depends(get_db)):
    """Crear un nuevo pedido"""
    # Validar que el cliente existe
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Validar que hay items
    if not pedido_data.items:
        raise HTTPException(status_code=400, detail="El pedido debe tener al menos un item")
    
    # Calcular total y crear items
    total = 0
    items_pedido = []
    
    for item_data in pedido_data.items:
        producto = db.query(Producto).filter(Producto.id == item_data.producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=404,
                detail=f"Producto {item_data.producto_id} no encontrado"
            )
        
        if producto.stock < item_data.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {producto.nombre}"
            )
        
        subtotal = producto.precio * item_data.cantidad
        total += subtotal
        
        item_pedido = ItemPedido(
            producto_id=item_data.producto_id,
            cantidad=item_data.cantidad,
            precio_unitario=producto.precio,
            subtotal=subtotal,
        )
        items_pedido.append(item_pedido)
        
        # Actualizar stock
        producto.stock -= item_data.cantidad
    
    # Crear el pedido
    numero_pedido = generar_numero_pedido(db)
    db_pedido = Pedido(
        cliente_id=cliente_id,
        numero_pedido=numero_pedido,
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


@router.put("/{pedido_id}", response_model=PedidoResponse)
def actualizar_pedido(
    pedido_id: int, pedido_data: PedidoUpdate, db: Session = Depends(get_db)
):
    """Actualizar estado o notas de un pedido"""
    db_pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    datos_actualizacion = pedido_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizacion.items():
        setattr(db_pedido, campo, valor)
    
    db_pedido.actualizado_en = datetime.utcnow()
    db.commit()
    db.refresh(db_pedido)
    return db_pedido


@router.post("/{pedido_id}/cancelar")
def cancelar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    """Cancelar un pedido (devuelve stock)"""
    db_pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    if db_pedido.estado == EstadoPedido.CANCELADO:
        raise HTTPException(status_code=400, detail="El pedido ya está cancelado")
    
    # Devolver stock
    for item in db_pedido.items:
        producto = item.producto
        producto.stock += item.cantidad
    
    db_pedido.estado = EstadoPedido.CANCELADO
    db_pedido.actualizado_en = datetime.utcnow()
    db.commit()
    
    return {"mensaje": "Pedido cancelado y stock devuelto exitosamente"}