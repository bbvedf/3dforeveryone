from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Pedido, ItemPedido, Producto, Cliente, Categoria, EstadoPedido
from app.security import require_admin
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])


# =============== SCHEMAS ===============

class KPICard(BaseModel):
    label: str
    value: float
    unit: str = ""
    variation: Optional[float] = None  # % cambio vs período anterior
    color: Optional[str] = None


class SalesData(BaseModel):
    date: str
    total: float
    orders_count: int


class TopProduct(BaseModel):
    id: int
    nombre: str
    cantidad_vendida: int
    ingresos: float


class OrdersByStatus(BaseModel):
    estado: str
    cantidad: int
    porcentaje: float


class DashboardStats(BaseModel):
    # KPIs principales
    ingresos_mes: KPICard
    ingresos_hoy: KPICard
    pedidos_confirmados: KPICard
    pedidos_pendientes: KPICard
    clientes_nuevos_mes: KPICard
    productos_bajo_stock: KPICard
    
    # Datos expandibles
    ventas_ultimos_30_dias: List[SalesData]
    top_productos: List[TopProduct]
    pedidos_por_estado: List[OrdersByStatus]
    distribucion_por_categoria: List[dict]  # {categoria: str, cantidad: int, ingresos: float}
    productos_bajo_stock_detalle: List[dict]  # {id, nombre, stock}


# =============== FUNCIONES HELPER ===============

def get_period_dates(period: str = "month"):
    """Retorna fecha inicio y fin del período"""
    hoy = datetime.utcnow().date()
    
    if period == "today":
        fecha_inicio = datetime.combine(hoy, datetime.min.time())
        fecha_fin = datetime.combine(hoy, datetime.max.time())
    elif period == "week":
        fecha_inicio = hoy - timedelta(days=hoy.weekday())
        fecha_fin = fecha_inicio + timedelta(days=6)
        fecha_inicio = datetime.combine(fecha_inicio, datetime.min.time())
        fecha_fin = datetime.combine(fecha_fin, datetime.max.time())
    else:  # month (default)
        fecha_inicio = datetime(hoy.year, hoy.month, 1)
        if hoy.month == 12:
            fecha_fin = datetime(hoy.year + 1, 1, 1)
        else:
            fecha_fin = datetime(hoy.year, hoy.month + 1, 1)
    
    return fecha_inicio, fecha_fin


def get_previous_period_dates(period: str = "month"):
    """Retorna fechas del período anterior"""
    hoy = datetime.utcnow().date()
    
    if period == "today":
        hoy_anterior = hoy - timedelta(days=1)
        fecha_inicio = datetime.combine(hoy_anterior, datetime.min.time())
        fecha_fin = datetime.combine(hoy_anterior, datetime.max.time())
    elif period == "week":
        fecha_inicio = hoy - timedelta(days=hoy.weekday() + 7)
        fecha_fin = fecha_inicio + timedelta(days=6)
        fecha_inicio = datetime.combine(fecha_inicio, datetime.min.time())
        fecha_fin = datetime.combine(fecha_fin, datetime.max.time())
    else:  # month
        if hoy.month == 1:
            fecha_inicio = datetime(hoy.year - 1, 12, 1)
            fecha_fin = datetime(hoy.year, 1, 1)
        else:
            fecha_inicio = datetime(hoy.year, hoy.month - 1, 1)
            fecha_fin = datetime(hoy.year, hoy.month, 1)
    
    return fecha_inicio, fecha_fin


# =============== ENDPOINTS ===============

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    period: str = "month",
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Endpoint centralizado de estadísticas del dashboard"""
    
    # Períodos
    fecha_inicio, fecha_fin = get_period_dates(period)
    fecha_inicio_prev, fecha_fin_prev = get_previous_period_dates(period)
    
    # =============== KPI 1: INGRESOS MES ===============
    ingresos_mes = db.query(func.coalesce(func.sum(Pedido.total), 0)).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= fecha_inicio,
        Pedido.creado_en < fecha_fin
    ).scalar() or 0
    
    ingresos_mes_prev = db.query(func.coalesce(func.sum(Pedido.total), 0)).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= fecha_inicio_prev,
        Pedido.creado_en < fecha_fin_prev
    ).scalar() or 0
    
    variacion_ingresos = None
    if ingresos_mes_prev > 0:
        variacion_ingresos = ((ingresos_mes - ingresos_mes_prev) / ingresos_mes_prev) * 100
    
    kpi_ingresos_mes = KPICard(
        label="Ingresos" if period == "month" else f"Ingresos ({period})",
        value=round(ingresos_mes, 2),
        unit="$",
        variation=round(variacion_ingresos, 1) if variacion_ingresos else None,
        color="green" if ingresos_mes > 0 else "gray"
    )
    
    # =============== KPI 2: INGRESOS HOY ===============
    hoy = datetime.utcnow().date()
    fecha_hoy_inicio = datetime.combine(hoy, datetime.min.time())
    fecha_hoy_fin = datetime.combine(hoy, datetime.max.time())
    
    ingresos_hoy = db.query(func.coalesce(func.sum(Pedido.total), 0)).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= fecha_hoy_inicio,
        Pedido.creado_en < fecha_hoy_fin
    ).scalar() or 0
    
    kpi_ingresos_hoy = KPICard(
        label="Ingresos Hoy",
        value=round(ingresos_hoy, 2),
        unit="$",
        color="blue"
    )
    
    # =============== KPI 3: PEDIDOS CONFIRMADOS ===============
    pedidos_confirmados = db.query(func.count(Pedido.id)).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= fecha_inicio,
        Pedido.creado_en < fecha_fin
    ).scalar() or 0
    
    kpi_pedidos_confirmados = KPICard(
        label="Pedidos Confirmados",
        value=pedidos_confirmados,
        color="green"
    )
    
    # =============== KPI 4: PEDIDOS PENDIENTES ===============
    pedidos_pendientes = db.query(func.count(Pedido.id)).filter(
        Pedido.estado == EstadoPedido.PENDIENTE
    ).scalar() or 0
    
    kpi_pedidos_pendientes = KPICard(
        label="Pedidos Pendientes",
        value=pedidos_pendientes,
        color="orange" if pedidos_pendientes > 0 else "gray"
    )
    
    # =============== KPI 5: CLIENTES NUEVOS ===============
    clientes_nuevos = db.query(func.count(Cliente.id)).filter(
        Cliente.creado_en >= fecha_inicio,
        Cliente.creado_en < fecha_fin
    ).scalar() or 0
    
    kpi_clientes_nuevos = KPICard(
        label="Clientes Nuevos",
        value=clientes_nuevos,
        color="purple"
    )
    
    # =============== KPI 6: PRODUCTOS BAJO STOCK ===============
    productos_bajo_stock_count = db.query(func.count(Producto.id)).filter(
        Producto.stock < 5,
        Producto.activo == True
    ).scalar() or 0
    
    kpi_bajo_stock = KPICard(
        label="Bajo Stock",
        value=productos_bajo_stock_count,
        color="red" if productos_bajo_stock_count > 0 else "gray"
    )
    
    # =============== VENTAS ÚLTIMOS 30 DÍAS ===============
    hace_30 = datetime.utcnow() - timedelta(days=30)
    
    ventas_30 = db.query(
        func.date(Pedido.creado_en).label("fecha"),
        func.coalesce(func.sum(Pedido.total), 0).label("total"),
        func.count(Pedido.id).label("orders")
    ).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= hace_30
    ).group_by(func.date(Pedido.creado_en)).all()
    
    ventas_ultimos_30 = [
        SalesData(date=str(v[0]), total=float(v[1]), orders_count=int(v[2]))
        for v in ventas_30
    ]
    
    # =============== TOP 5 PRODUCTOS ===============
    top_5 = db.query(
        Producto.id,
        Producto.nombre,
        func.sum(ItemPedido.cantidad).label("cantidad_vendida"),
        func.sum(ItemPedido.precio_unitario * ItemPedido.cantidad).label("ingresos")
    ).join(ItemPedido).join(Pedido).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= fecha_inicio,
        Pedido.creado_en < fecha_fin
    ).group_by(Producto.id, Producto.nombre).order_by(
        func.sum(ItemPedido.cantidad).desc()
    ).limit(5).all()
    
    top_productos = [
        TopProduct(
            id=p[0],
            nombre=p[1],
            cantidad_vendida=int(p[2]) if p[2] else 0,
            ingresos=float(p[3]) if p[3] else 0
        )
        for p in top_5
    ]
    
    # =============== PEDIDOS POR ESTADO ===============
    estados_count = db.query(
        Pedido.estado,
        func.count(Pedido.id).label("cantidad")
    ).filter(
        Pedido.creado_en >= fecha_inicio,
        Pedido.creado_en < fecha_fin
    ).group_by(Pedido.estado).all()
    
    total_pedidos_periodo = sum([e[1] for e in estados_count])
    
    pedidos_por_estado = [
        OrdersByStatus(
            estado=str(e[0].value),
            cantidad=int(e[1]),
            porcentaje=round((e[1] / total_pedidos_periodo * 100), 1) if total_pedidos_periodo > 0 else 0
        )
        for e in estados_count
    ]
    
    # =============== DISTRIBUCIÓN POR CATEGORÍA ===============
    por_categoria = db.query(
        Categoria.nombre,
        func.count(Pedido.id).label("cantidad"),
        func.coalesce(func.sum(Pedido.total), 0).label("ingresos")
    ).join(ItemPedido, Pedido.items).join(Producto).join(Categoria).filter(
        Pedido.estado.in_([EstadoPedido.CONFIRMADO, EstadoPedido.PROCESANDO, EstadoPedido.ENVIADO, EstadoPedido.ENTREGADO]),
        Pedido.creado_en >= fecha_inicio,
        Pedido.creado_en < fecha_fin
    ).group_by(Categoria.nombre).order_by(
        func.sum(Pedido.total).desc()
    ).all()
    
    distribucion_categoria = [
        {
            "categoria": c[0],
            "cantidad": int(c[1]),
            "ingresos": float(c[2])
        }
        for c in por_categoria
    ]
    
    # =============== PRODUCTOS BAJO STOCK DETALLE ===============
    bajo_stock_detalle = db.query(
        Producto.id,
        Producto.nombre,
        Producto.stock
    ).filter(
        Producto.stock < 5,
        Producto.activo == True
    ).order_by(Producto.stock).limit(10).all()
    
    productos_bajo_stock_lista = [
        {
            "id": p[0],
            "nombre": p[1],
            "stock": int(p[2])
        }
        for p in bajo_stock_detalle
    ]
    
    return DashboardStats(
        ingresos_mes=kpi_ingresos_mes,
        ingresos_hoy=kpi_ingresos_hoy,
        pedidos_confirmados=kpi_pedidos_confirmados,
        pedidos_pendientes=kpi_pedidos_pendientes,
        clientes_nuevos_mes=kpi_clientes_nuevos,
        productos_bajo_stock=kpi_bajo_stock,
        ventas_ultimos_30_dias=ventas_ultimos_30,
        top_productos=top_productos,
        pedidos_por_estado=pedidos_por_estado,
        distribucion_por_categoria=distribucion_categoria,
        productos_bajo_stock_detalle=productos_bajo_stock_lista
    )
