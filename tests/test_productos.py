"""
Tests de CRUD de productos.
"""
from fastapi import status


class TestListarProductos:
    def test_listar_publico(self, client):
        """GET /productos/ es público y devuelve lista."""
        resp = client.get("/productos/")
        assert resp.status_code == status.HTTP_200_OK
        assert isinstance(resp.json(), list)

    def test_listar_incluye_producto_creado(self, client, producto):
        """El producto del fixture aparece en la lista activa."""
        resp = client.get("/productos/?activo=true")
        assert resp.status_code == status.HTTP_200_OK
        ids = [p["id"] for p in resp.json()]
        assert producto.id in ids

    def test_obtener_por_id(self, client, producto):
        """GET /productos/{id} devuelve el producto correcto."""
        resp = client.get(f"/productos/{producto.id}")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["id"] == producto.id
        assert resp.json()["nombre"] == producto.nombre

    def test_obtener_id_inexistente(self, client):
        """GET /productos/99999 devuelve 404."""
        resp = client.get("/productos/99999")
        assert resp.status_code == status.HTTP_404_NOT_FOUND


class TestCrearProducto:
    def _payload(self, categoria_id: int) -> dict:
        return {
            "nombre": "Test Producto Nuevo",
            "descripcion": "Descripción",
            "precio": 19.99,
            "categoria_id": categoria_id,
            "material": "PLA",
            "stock": 5,
            "activo": True,
        }

    def test_admin_puede_crear(self, client, admin_token, categoria):
        """Un admin puede crear un producto."""
        resp = client.post(
            "/productos/",
            json=self._payload(categoria.id),
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data["nombre"] == "Test Producto Nuevo"
        assert data["precio"] == 19.99

    def test_cliente_no_puede_crear(self, client, user_token, categoria):
        """Un cliente recibe 403."""
        resp = client.post(
            "/productos/",
            json=self._payload(categoria.id),
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_sin_token_no_puede_crear(self, client, categoria):
        """Sin token se recibe 401."""
        resp = client.post("/productos/", json=self._payload(categoria.id))
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_categoria_inexistente_devuelve_404(self, client, admin_token):
        """Crear producto con categoría inexistente devuelve 404."""
        resp = client.post(
            "/productos/",
            json=self._payload(99999),
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND


class TestEditarProducto:
    def test_admin_puede_editar_precio(self, client, admin_token, producto):
        """Un admin puede actualizar el precio de un producto."""
        resp = client.put(
            f"/productos/{producto.id}",
            json={"precio": 29.99},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["precio"] == 29.99

    def test_soft_delete(self, client, admin_token, producto):
        """DELETE desactiva el producto (soft delete)."""
        resp = client.delete(
            f"/productos/{producto.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK

        # El producto sigue existiendo pero activo=False
        resp2 = client.get(f"/productos/{producto.id}")
        assert resp2.status_code == status.HTTP_200_OK
        assert resp2.json()["activo"] is False
