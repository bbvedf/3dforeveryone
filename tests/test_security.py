import pytest
from fastapi import status
from fastapi.testclient import TestClient
from app.limiter import limiter

class TestRateLimiting:
    def test_login_rate_limiting(self, client: TestClient, db):
        """Verifica que tras 5 intentos se devuelve 429 Too Many Requests."""
        # Habilitamos el limiter solo para este test
        limiter.enabled = True
        
        # Necesitamos simular una IP consistente para que el rate limiter cuente.
        # En FastAPI, el TestClient siempre usa 'testclient' como host por defecto.
        # Hacemos 5 peticiones y la sexta debe fallar.
        for _ in range(5):
            resp = client.post("/auth/login", data={
                "username": "usuario@test.com",
                "password": "FakePassword123"
            })
            # El login fallará con 401 porque el usuario no existe, pero 
            # lo importante es que el rate limiter cuente la petición.
            assert resp.status_code == status.HTTP_401_UNAUTHORIZED
            
        # La número 6 debe bloquearse
        resp_bloqueada = client.post("/auth/login", data={
            "username": "usuario@test.com",
            "password": "FakePassword123"
        })
        
        # Volvemos a deshabilitar el limiter para no afectar a otros tests
        limiter.enabled = False
        
        assert resp_bloqueada.status_code == status.HTTP_429_TOO_MANY_REQUESTS


class TestCORS:
    def test_cors_origenes_no_permitidos(self):
        """Verifica que un origen no permitido no recibe los headers CORS adecuados."""
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.testclient import TestClient

        # Creamos una mini-app al vuelo simulando nuestra app principal en producción
        test_app = FastAPI()
        test_app.add_middleware(
            CORSMiddleware,
            allow_origins=["https://mi-tienda-oficial.com"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @test_app.post("/auth/login")
        def dummy_login():
            return {"status": "ok"}

        mini_client = TestClient(test_app)

        # Simulamos una preflight request CORS (OPTIONS) desde un atacante
        resp = mini_client.options("/auth/login", headers={
            "Origin": "https://dominio-atacante.com",
            "Access-Control-Request-Method": "POST"
        })
        
        # FastAPI CORS middleware si rechaza el dominio, directamente NO incluye
        # la cabecera access-control-allow-origin, o devuelve un 400 en algunos casos.
        allow_origin = resp.headers.get("access-control-allow-origin")
        assert allow_origin != "https://dominio-atacante.com"
        assert allow_origin is None

