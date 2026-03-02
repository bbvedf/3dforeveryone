"""
Script para inicializar la base de datos con datos de ejemplo.
Ejecutar con: docker-compose exec api python -m database.init_db
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, Categoria, Producto, Cliente, RolUsuario
from app.security import hash_password


def init_db():
    """Crear tablas y llenarlas con datos de ejemplo"""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        if db.query(Categoria).count() > 0:
            print("⚠️  La base de datos ya contiene datos. Abortando...")
            return

        # ── Categorías ─────────────────────────────────────────────────────────
        categorias = [
            Categoria(nombre="Figuras Decorativas",    descripcion="Modelos 3D decorativos para el hogar", activa=True),
            Categoria(nombre="Funcionales",             descripcion="Objetos útiles e imprimibles en 3D",   activa=True),
            Categoria(nombre="Juguetes y Modelos",      descripcion="Juguetes, figuritas y réplicas",       activa=True),
            Categoria(nombre="Accesorios para Impresora", descripcion="Piezas y accesorios para impresoras 3D", activa=True),
        ]
        db.add_all(categorias)
        db.flush()

        # ── Productos ──────────────────────────────────────────────────────────
        productos = [
            # Figuras Decorativas
            Producto(nombre="Busto de David",         descripcion="Réplica del famoso busto de Miguel Ángel",  precio=45.99, categoria_id=categorias[0].id, material="PLA",   peso_gramos=150, dimensiones="15x15x20 cm", tiempo_impresion_horas=8,  stock=10, activo=True),
            Producto(nombre="Lámpara Geométrica",     descripcion="Lámpara con diseño geométrico moderno",     precio=32.50, categoria_id=categorias[0].id, material="PLA",   peso_gramos=200, dimensiones="20x20x25 cm", tiempo_impresion_horas=12, stock=8,  activo=True),
            Producto(nombre="Maceta Hexagonal",       descripcion="Maceta decorativa con diseño hexagonal",    precio=18.99, categoria_id=categorias[0].id, material="PLA",   peso_gramos=100, dimensiones="12x12x15 cm", tiempo_impresion_horas=5,  stock=15, activo=True),
            # Funcionales
            Producto(nombre="Organizador de Escritorio", descripcion="Organizador modular para tu escritorio", precio=24.99, categoria_id=categorias[1].id, material="PLA",   peso_gramos=120, dimensiones="25x20x10 cm", tiempo_impresion_horas=6,  stock=12, activo=True),
            Producto(nombre="Soporte para Teléfono",  descripcion="Soporte ajustable para cualquier smartphone", precio=12.99, categoria_id=categorias[1].id, material="NYLON", peso_gramos=50, dimensiones="8x8x12 cm",   tiempo_impresion_horas=2,  stock=25, activo=True),
            Producto(nombre="Cable Organizer",        descripcion="Organizador para cables y adaptadores",     precio=8.99,  categoria_id=categorias[1].id, material="PLA",   peso_gramos=30,  dimensiones="10x5x5 cm",   tiempo_impresion_horas=1,  stock=30, activo=True),
            # Juguetes y Modelos
            Producto(nombre="Dragón Articulado",      descripcion="Dragón imprimible con articulaciones móviles", precio=28.50, categoria_id=categorias[2].id, material="NYLON", peso_gramos=180, dimensiones="20x15x15 cm", tiempo_impresion_horas=10, stock=7, activo=True),
            Producto(nombre="Mini Casa de Hadas",     descripcion="Casa decorativa en miniatura para el jardín", precio=35.99, categoria_id=categorias[2].id, material="PLA",   peso_gramos=250, dimensiones="15x15x20 cm", tiempo_impresion_horas=14, stock=5, activo=True),
            Producto(nombre="Puzzle 3D Mecánico",     descripcion="Puzzle tridimensional con piezas móviles",  precio=19.99, categoria_id=categorias[2].id, material="ABS",   peso_gramos=120, dimensiones="18x18x5 cm",  tiempo_impresion_horas=8,  stock=9, activo=True),
            # Accesorios para Impresora
            Producto(nombre="Cama de Impresión Texturizada", descripcion="Superficie para cama caliente con textura mejorada", precio=29.99, categoria_id=categorias[3].id, material="PEI", peso_gramos=80, dimensiones="25x25x1 cm", tiempo_impresion_horas=0, stock=20, activo=True),
            Producto(nombre="Clip Magnético para Filamento", descripcion="Clip magnético para mantener bobina de filamento", precio=9.99, categoria_id=categorias[3].id, material="PLA", peso_gramos=40, dimensiones="5x5x3 cm", tiempo_impresion_horas=1, stock=40, activo=True),
        ]
        db.add_all(productos)
        db.flush()

        # ── Clientes + Admin ───────────────────────────────────────────────────
        clientes = [
            # Admin
            Cliente(email="admin@3dforeveryone.com", nombre="Admin",  apellido="3DForEveryone", ciudad="Madrid",    pais="España", contraseña_hash=hash_password("Admin3D2024!"), rol=RolUsuario.ADMIN,    activo=True),
            # Clientes normales
            Cliente(email="juan@example.com",        nombre="Juan",   apellido="García",        telefono="+34612345678", direccion="Calle Principal 123", ciudad="Madrid",    codigo_postal="28001", pais="España", contraseña_hash=hash_password("password123"), rol=RolUsuario.CLIENTE, activo=True),
            Cliente(email="maria@example.com",       nombre="María",  apellido="López",         telefono="+34687654321", direccion="Avenida Central 456", ciudad="Barcelona", codigo_postal="08002", pais="España", contraseña_hash=hash_password("password456"), rol=RolUsuario.CLIENTE, activo=True),
            Cliente(email="carlos@example.com",      nombre="Carlos", apellido="Rodríguez",     telefono="+34633333333", direccion="Calle del Sol 789",   ciudad="Valencia",  codigo_postal="46001", pais="España", contraseña_hash=hash_password("password789"), rol=RolUsuario.CLIENTE, activo=True),
        ]
        db.add_all(clientes)
        db.commit()

        print("✓ Base de datos inicializada correctamente")
        print(f"✓ {len(categorias)} categorías creadas")
        print(f"✓ {len(productos)} productos creados")
        print(f"✓ {len(clientes)} usuarios creados (1 admin + {len(clientes)-1} clientes)")
        print()
        print("─── Credenciales admin ───────────────────────")
        print("  Email:     admin@3dforeveryone.com")
        print("  Password:  Admin3D2024!")
        print("─────────────────────────────────────────────")

    except Exception as e:
        db.rollback()
        print(f"✗ Error al inicializar la BD: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()