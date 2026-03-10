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

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar en producción
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