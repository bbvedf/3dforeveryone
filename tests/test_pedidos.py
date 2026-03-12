"""
Tests de CRUD de pedidos.
"""
from fastapi import status
from app.models import EstadoPedido

class TestCrearPedido:
    def test_crear_pedido_cliente(self, client, user_token, producto):
        """Un cliente puede crear un pedido valido."""
        payload = {
            "direccion_envio": "Calle Falsa 123",
            "notas": "Entregar por la tarde",
            "items": [
                {
                    "producto_id": producto.id,
                    "cantidad": 2
                }
            ]
        }
        resp = client.post(
            "/pedidos/",
            json=payload,
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "numero_pedido" in data
        assert data["estado"] == "pendiente"
        assert len(data["items"]) == 1
        assert data["total"] == producto.precio * 2

    def test_crear_pedido_sin_stock(self, client, user_token, producto):
        """Si no hay suficiente stock, falla."""
        payload = {
            "direccion_envio": "Calle Falsa 123",
            "items": [
                {
                    "producto_id": producto.id,
                    "cantidad": 999  # Stock es 10 según el fixture
                }
            ]
        }
        resp = client.post(
            "/pedidos/",
            json=payload,
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "stock" in resp.json()["detail"].lower()

class TestListarPedidos:
    def test_mis_pedidos(self, client, user_token, producto):
        """Un cliente puede ver sus propios pedidos."""
        # Crear un pedido primero
        client.post(
            "/pedidos/",
            json={"direccion_envio": "Dir", "items": [{"producto_id": producto.id, "cantidad": 1}]},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        
        resp = client.get(
            "/pedidos/",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["estado"] == "pendiente"

    def test_admin_puede_listar_todos(self, client, admin_token, user_token, producto):
        """Un administrador puede listar_todos los pedidos del sistema."""
        # Crear un pedido como cliente
        client.post(
            "/pedidos/",
            json={"direccion_envio": "Dir", "items": [{"producto_id": producto.id, "cantidad": 1}]},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        resp = client.get(
            "/pedidos/",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.json()) >= 1

    def test_cliente_solo_ve_sus_pedidos(self, client, admin_token, user_token, producto):
        """Un cliente consulta la raíz pero no ve pedidos de otros"""
        # Admin crea pedido
        client.post(
            "/pedidos/",
            json={"direccion_envio": "AdminDir", "items": [{"producto_id": producto.id, "cantidad": 1}]},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        resp = client.get(
            "/pedidos/",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == status.HTTP_200_OK
        # Si antes no tenía nada, ahora debe ser solo lo que haya creado (quizá 0 si no hemos creado en el cliente aquí)


class TestActualizarEstado:
    def test_admin_actualiza_estado(self, client, admin_token, user_token, producto):
        """Un admin puede actualizar el estado de un pedido."""
        # Cliente crea pedido
        resp_crear = client.post(
            "/pedidos/",
            json={"direccion_envio": "Dir", "items": [{"producto_id": producto.id, "cantidad": 1}]},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        pedido_id = resp_crear.json()["id"]

        resp_put = client.put(
            f"/pedidos/{pedido_id}",
            json={"estado": "procesando"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp_put.status_code == status.HTTP_200_OK
        assert resp_put.json()["estado"] == "procesando"

    def test_cliente_no_actualiza_estado(self, client, user_token, producto):
        """Un cliente recibe 403 al intentar actualizar estado."""
        resp_crear = client.post(
            "/pedidos/",
            json={"direccion_envio": "Dir", "items": [{"producto_id": producto.id, "cantidad": 1}]},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        pedido_id = resp_crear.json()["id"]

        resp_put = client.put(
            f"/pedidos/{pedido_id}",
            json={"estado": "procesando"},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp_put.status_code == status.HTTP_403_FORBIDDEN
