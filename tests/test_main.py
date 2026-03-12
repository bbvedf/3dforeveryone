import pytest
from fastapi import status

def test_root_endpoint(client):
    """Comprueba que la raíz devuelve el mensaje esperado"""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["mensaje"] == "Bienvenido a Tienda 3D API"

def test_health_endpoint(client):
    """Comprueba que el endpoint de salud está activo"""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "ok"}
