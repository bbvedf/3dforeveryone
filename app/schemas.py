from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum


# ── Roles ──────────────────────────────────────────────────────────────────────
class RolUsuario(str, Enum):
    ADMIN = "admin"
    CLIENTE = "cliente"


# ── Token JWT ──────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str


# ── Categorías ─────────────────────────────────────────────────────────────────
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activa: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    activa: Optional[bool] = None


class Categoria(CategoriaBase):
    id: int
    creada_en: datetime

    class Config:
        from_attributes = True


# ── Productos ──────────────────────────────────────────────────────────────────
class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    categoria_id: int
    material: Optional[str] = None
    peso_gramos: Optional[float] = None
    dimensiones: Optional[str] = None
    tiempo_impresion_horas: Optional[float] = None
    stock: int = 0
    activo: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    categoria_id: Optional[int] = None
    material: Optional[str] = None
    peso_gramos: Optional[float] = None
    dimensiones: Optional[str] = None
    tiempo_impresion_horas: Optional[float] = None
    stock: Optional[int] = None
    activo: Optional[bool] = None


class Producto(ProductoBase):
    id: int
    creado_en: datetime
    actualizado_en: datetime

    class Config:
        from_attributes = True


# ── Clientes ───────────────────────────────────────────────────────────────────
class ClienteBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None
    pais: Optional[str] = None


class ClienteCreate(ClienteBase):
    contraseña: str


class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    codigo_postal: Optional[str] = None
    pais: Optional[str] = None


class Cliente(ClienteBase):
    id: int
    rol: RolUsuario
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True


# ── Items de pedido ────────────────────────────────────────────────────────────
class ItemPedidoBase(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float
    subtotal: float


class ItemPedidoCreate(BaseModel):
    producto_id: int
    cantidad: int


class ItemPedido(ItemPedidoBase):
    id: int

    class Config:
        from_attributes = True


# ── Pedidos ────────────────────────────────────────────────────────────────────
class PedidoBase(BaseModel):
    direccion_envio: str
    notas: Optional[str] = None


class PedidoCreate(PedidoBase):
    items: List[ItemPedidoCreate]


class PedidoUpdate(BaseModel):
    estado: Optional[str] = None
    notas: Optional[str] = None


class PedidoResponse(BaseModel):
    id: int
    cliente_id: int
    numero_pedido: str
    estado: str
    total: float
    direccion_envio: str
    notas: Optional[str]
    creado_en: datetime
    actualizado_en: datetime
    items: List[ItemPedido] = []

    class Config:
        from_attributes = True