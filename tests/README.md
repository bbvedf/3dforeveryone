# 🧪 Tests de 3DForEveryone

Este directorio contiene la suite de pruebas automatizadas para la API construida con FastAPI.

## 🛠️ Herramientas
- **Pytest**: Motor de ejecución de tests.
Requiere instalar las librerías pytest, pytest-asyncio y sqlalchemy-utils. Ver requirements.txt
- **FastAPI TestClient**: Para simular peticiones HTTP a los endpoints.
- **SQLite (En Memoria)**: Se utiliza una base de datos temporal `sqlite:///./test.db` que se crea y destruye en cada test, aislando completamente las pruebas de la base de datos de producción (PostgreSQL).
- **Vitest**: Motor de ejecución de tests para el frontend.
Requiere instalar las librerías vitest, jest-dom, @testing-library/react y @testing-library/. Ver package.json.

## 🚀 Ejecución

Para ejecutar todas las pruebas de backend y obtener una salida resumida limpia (desde raiz):

```bash 
pytest -q
```

Para ver el nivel de detalle máximo (verbose):
```bash
pytest -v
```

> **Nota**: Los _warnings_ de deprecación de librerías terceras (como Pydantic o Passlib) se han silenciado usando `pytest.ini` para tener una salida totalmente verde.

Para ejecutar todas las pruebas de frontend y obtener una salida resumida limpia (desde frontend):

```bash 
npm test
```


## ✅ Cobertura Actual

1. **Autenticación (`test_auth.py`)**:
   - Creación transaccional de usuarios y obtención de JWT `Bearer` tokens.
   - Seguridad: Sin contraseñas harcodeadas en el código que se versiona en Git.
2. **Categorías (`test_categorias.py`)**:
   - Lógicas CRUD.
   - Permisos y restricciones por rol (Admin vs Cliente).
3. **Productos (`test_productos.py`)**:
   - Creación, edición (precio) y _soft delete_ protegido para administradores.
   - Restricciones sobre categorías inexistentes.
4. **Pedidos (`test_pedidos.py`)**:
   - Creación de pedidos validando el stock de productos disponible.
   - Funcionalidad de clientes listando exclusivamente sus propios pedidos.
   - Funcionalidad de administradores listando la vista global y cambiando el estado del pedido.
5. **Seguridad General (`test_security.py`)**:
   - Limitador de tasa (Rate Limiting) de FastAPI asegurando protección frente ataques de fuerza bruta (DDoS prevention).
   - Pruebas estrictas de políticas CORS asegurando rechazo contundente a orígenes no confiables.

6. **Frontend (`*.test*.jsx`)**:
   - Tests de rutas protegidas (`ProtectedRoute.test.jsx`): redirección a login sin auth, acceso a rutas admin solo para admins, acceso concedido a usuarios autenticados.
   - Tests de Login (`Login.test.jsx`): renderizado de formulario, submit con credenciales válidas/inválidas, almacenamiento de token en localStorage, manejo de errores de autenticación.
   - Tests del Carrito de Compra (`Cart.test.jsx`): CartContext (estado vacío, add/remove/update/clear, incremento de cantidad) y CartDrawer (renderizado condicional, mensaje vacío, checkout habilitado).
   - Tests de Registro (`Register.test.jsx`): validación de email, passwords coincidentes, longitud mínima de contraseña/nombre, campos requeridos, feedback visual de errores y registro exitoso.

## 📝 Reglas a Respetar en Nuevos Tests

1. **Aislamiento**: Usar los *fixtures* definidos en `conftest.py` (ej. `db` o `client`) para asegurar que todo corre bajo transacciones que se reverten solas (rollback preventivo).
2. **Cero Credenciales Constantes**: Usar el fixture `admin_user` / `admin_token` que inyecta los datos de sesión dinámicamente y protege la seguridad del repositorio.
3. **Control del Rate Limiting**: El endpoint general tiene 5 peticiones por minuto. El archivo `conftest.py` desactiva globalmente `slowapi` durante el contexto del test para no arrojar errores falsos `429 Too Many Requests`.
