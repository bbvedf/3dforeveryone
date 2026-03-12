"""
Tests de autenticación.
No contiene credenciales reales: los usuarios se crean y destruyen
dentro de la transacción de cada test mediante fixtures de conftest.
"""
import pytest
from fastapi import status


class TestLogin:
    def test_login_exitoso(self, client, admin_user):
        """Un admin recién creado puede hacer login y recibe un token."""
        resp = client.post("/auth/login", data={
            "username": admin_user.email,
            "password": "TestAdmin#99",
        })
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_password_incorrecta(self, client, admin_user):
        """Contraseña incorrecta devuelve 401."""
        resp = client.post("/auth/login", data={
            "username": admin_user.email,
            "password": "contraseña_incorrecta",
        })
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_email_inexistente(self, client):
        """Email que no existe devuelve 401."""
        resp = client.post("/auth/login", data={
            "username": "noexiste@example.com",
            "password": "cualquiercosa",
        })
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_usuario_inactivo(self, client, db):
        """Un usuario desactivado no puede autenticarse."""
        from app.models import Cliente, RolUsuario
        from app.security import hash_password

        user = Cliente(
            email="inactivo@example.com",
            nombre="Bloqueado",
            apellido="Test",
            contraseña_hash=hash_password("TestPass#1"),
            rol=RolUsuario.CLIENTE,
            activo=False,
        )
        db.add(user)
        db.flush()

        resp = client.post("/auth/login", data={
            "username": "inactivo@example.com",
            "password": "TestPass#1",
        })
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED
