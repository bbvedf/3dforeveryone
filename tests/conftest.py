import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Usar SQLite para tests rápidos sin dependencias externas
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Importar la app DESPUÉS de fijar DATABASE_URL
from main import app
from app.database import Base, get_db
from app.models import Cliente, Categoria, Producto, RolUsuario
from app.security import hash_password
from app.limiter import limiter

# Deshabilitar rate limiting durante los tests
limiter.enabled = False

engine = create_engine(os.getenv("DATABASE_URL"), connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Crea tablas en la BD de pruebas."""
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def db():
    """Sesión de BD aislada que se revierte tras cada test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    """TestClient que usa la sesión de prueba."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Datos de prueba (sin credenciales reales hardcodeadas)
# ---------------------------------------------------------------------------
TEST_ADMIN_EMAIL = "test_admin@example.com"
TEST_ADMIN_PASS  = "TestAdmin#99"
TEST_USER_EMAIL  = "test_user@example.com"
TEST_USER_PASS   = "TestUser#99"


@pytest.fixture
def admin_user(db):
    """Crea un usuario admin sólo para la duración del test."""
    user = Cliente(
        email=TEST_ADMIN_EMAIL,
        nombre="Admin",
        apellido="Test",
        contraseña_hash=hash_password(TEST_ADMIN_PASS),
        rol=RolUsuario.ADMIN,
        activo=True,
    )
    db.add(user)
    db.flush()
    return user


@pytest.fixture
def regular_user(db):
    """Crea un usuario cliente sólo para la duración del test."""
    user = Cliente(
        email=TEST_USER_EMAIL,
        nombre="User",
        apellido="Test",
        contraseña_hash=hash_password(TEST_USER_PASS),
        rol=RolUsuario.CLIENTE,
        activo=True,
    )
    db.add(user)
    db.flush()
    return user


@pytest.fixture
def admin_token(client, admin_user):
    """Obtiene un JWT válido para el admin de prueba."""
    resp = client.post("/auth/login", data={
        "username": TEST_ADMIN_EMAIL,
        "password": TEST_ADMIN_PASS,
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.fixture
def user_token(client, regular_user):
    """Obtiene un JWT válido para el cliente de prueba."""
    resp = client.post("/auth/login", data={
        "username": TEST_USER_EMAIL,
        "password": TEST_USER_PASS,
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.fixture
def categoria(db):
    """Crea una categoría de prueba."""
    cat = Categoria(nombre="Cat Test", descripcion="Categoría de test", activa=True)
    db.add(cat)
    db.flush()
    return cat


@pytest.fixture
def producto(db, categoria):
    """Crea un producto de prueba."""
    prod = Producto(
        nombre="Producto Test",
        descripcion="Descripción de prueba",
        precio=9.99,
        categoria_id=categoria.id,
        material="PLA",
        stock=10,
        activo=True,
    )
    db.add(prod)
    db.flush()
    return prod
