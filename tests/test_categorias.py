"""
Tests de CRUD de categorías.
"""
from fastapi import status


class TestListarCategorias:
    def test_listar_publico(self, client):
        """GET /categorias/ es público y devuelve lista."""
        resp = client.get("/categorias/")
        assert resp.status_code == status.HTTP_200_OK
        assert isinstance(resp.json(), list)

    def test_listar_devuelve_categoria_creada(self, client, categoria):
        """La categoría creada en el fixture aparece en el listado."""
        resp = client.get("/categorias/")
        nombres = [c["nombre"] for c in resp.json()]
        assert categoria.nombre in nombres


class TestCrearCategoria:
    def test_admin_puede_crear(self, client, admin_token):
        """Un admin puede crear una nueva categoría."""
        resp = client.post(
            "/categorias/",
            json={"nombre": "Nueva Cat", "descripcion": "desc", "activa": True},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["nombre"] == "Nueva Cat"

    def test_cliente_no_puede_crear(self, client, user_token):
        """Un cliente normal recibe 403 al intentar crear una categoría."""
        resp = client.post(
            "/categorias/",
            json={"nombre": "Intento", "descripcion": "d", "activa": True},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_sin_token_no_puede_crear(self, client):
        """Sin token se recibe 401."""
        resp = client.post(
            "/categorias/",
            json={"nombre": "Sin auth", "descripcion": "d", "activa": True},
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestEditarCategoria:
    def test_admin_puede_editar(self, client, admin_token, categoria):
        """Un admin puede actualizar el nombre de una categoría."""
        resp = client.put(
            f"/categorias/{categoria.id}",
            json={"nombre": "Cat Editada"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["nombre"] == "Cat Editada"

    def test_editar_inexistente_devuelve_404(self, client, admin_token):
        """Editar una categoría que no existe devuelve 404."""
        resp = client.put(
            "/categorias/99999",
            json={"nombre": "No existe"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND
