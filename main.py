from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.models import Categoria, Producto, Cliente, Pedido, ItemPedido
from app.routes import categorias, productos, clientes, pedidos, auth, uploads, dashboard

# Crear tablas y directorios necesarios
Base.metadata.create_all(bind=engine)
Path("/app/uploads/productos").mkdir(parents=True, exist_ok=True)
Path("/app/uploads/avatares").mkdir(parents=True, exist_ok=True)
Path("/app/logs").mkdir(parents=True, exist_ok=True)

# Configuración de Logging
import logging
from logging.handlers import RotatingFileHandler

file_handler = RotatingFileHandler("/app/logs/api.log", maxBytes=10*1024*1024, backupCount=5)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)

# Configuración del root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[file_handler, logging.StreamHandler()]
)

logger = logging.getLogger("3dforeveryone")

from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar limitador
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware de seguridad: Trusted Host
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.back_end_trusted_hosts
)

# Configurar CORS (en producción usar settings.backend_cors_origins en lugar de ["*"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(clientes.router)
app.include_router(pedidos.router)
app.include_router(uploads.router)
app.include_router(dashboard.router)
# Stripe & PayPal payments
from app.routes import stripe_pago, paypal_pago
app.include_router(stripe_pago.router)
app.include_router(paypal_pago.router)

# Servir archivos estáticos (imágenes subidas)
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")


@app.get("/")
def read_root():
    """Endpoint raíz"""
    return {
        "mensaje": "Bienvenido a Tienda 3D API",
        "version": settings.api_version,
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Verificar salud de la aplicación"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )