# Tienda Online 3D - API FastAPI

Aplicación web para gestionar una tienda online de productos impresos en 3D. Construida con **FastAPI**, **PostgreSQL** y **Docker**.

## 🚀 Características

- ✅ Gestión de categorías de productos
- ✅ Catálogo completo de productos con detalles de impresión
- ✅ Sistema de clientes con registro y autenticación
- ✅ Gestión de pedidos y carrito
- ✅ Control de inventario (stock)
- ✅ API RESTful con documentación automática (Swagger)
- ✅ Base de datos PostgreSQL
- ✅ Docker para fácil despliegue
- ✅ Datos de ejemplo precargados

## 📋 Requisitos

- Docker y Docker Compose
- Ubuntu 20+ (o cualquier sistema con Docker)
- Python 3.11+ (si ejecutas localmente sin Docker)

## 🏗️ Estructura del Proyecto

```
tienda-3d/
├── app/
│   ├── __init__.py
│   ├── config.py              # Configuración de la aplicación
│   ├── database.py            # Conexión a BD
│   ├── models.py              # Modelos SQLAlchemy
│   ├── schemas.py             # Esquemas Pydantic
│   └── routes/
│       ├── __init__.py
│       ├── categorias.py      # Endpoints de categorías
│       ├── productos.py       # Endpoints de productos
│       ├── clientes.py        # Endpoints de clientes
│       └── pedidos.py         # Endpoints de pedidos
├── database/
│   └── init_db.py             # Script para inicializar datos
├── main.py                    # Archivo principal
├── requirements.txt           # Dependencias Python
├── Dockerfile                 # Configuración Docker
├── docker-compose.yml         # Orquestación Docker
├── .env.example               # Variables de entorno
└── README.md                  # Este archivo
```

## 🔧 Instalación y Uso

### Opción 1: Con Docker (Recomendado)

1. **Clonar o descargar el proyecto**
   ```bash
   cd tienda-3d
   ```

2. **Crear archivo .env** (copiar desde .env.example)
   ```bash
   cp .env.example .env
   ```

3. **Iniciar los contenedores**
   ```bash
   docker-compose up -d
   ```

4. **Inicializar base de datos** (en la primera ejecución)
   ```bash
   docker-compose exec api python -m database.init_db
   ```

5. **Acceder a la API**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
   - API: http://localhost:8000

### Opción 2: Instalación Local

1. **Crear entorno virtual**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar base de datos PostgreSQL**
   - Cambiar las credenciales en `.env` según tu instalación
   - Asegurar que PostgreSQL está ejecutándose

4. **Inicializar datos**
   ```bash
   python -m database.init_db
   ```

5. **Ejecutar la aplicación**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 Endpoints Disponibles

### Categorías
- `GET /categorias/` - Listar categorías
- `GET /categorias/{id}` - Obtener categoría
- `POST /categorias/` - Crear categoría
- `PUT /categorias/{id}` - Actualizar categoría
- `DELETE /categorias/{id}` - Eliminar categoría

### Productos
- `GET /productos/` - Listar productos
- `GET /productos/{id}` - Obtener producto
- `POST /productos/` - Crear producto
- `PUT /productos/{id}` - Actualizar producto
- `DELETE /productos/{id}` - Desactivar producto

### Clientes
- `GET /clientes/` - Listar clientes
- `GET /clientes/{id}` - Obtener cliente
- `POST /clientes/registro` - Registrar nuevo cliente
- `PUT /clientes/{id}` - Actualizar datos cliente
- `DELETE /clientes/{id}` - Desactivar cliente

### Pedidos
- `GET /pedidos/` - Listar pedidos
- `GET /pedidos/{id}` - Obtener pedido
- `POST /pedidos/` - Crear pedido
- `PUT /pedidos/{id}` - Actualizar pedido
- `POST /pedidos/{id}/cancelar` - Cancelar pedido

## 💾 Base de Datos

### Tablas principales

- **categorias**: Categorías de productos
- **productos**: Catálogo de productos
- **clientes**: Datos de clientes registrados
- **pedidos**: Historial de pedidos
- **items_pedido**: Detalles de items en cada pedido

### Datos de Ejemplo Incluidos

**Categorías:**
- Figuras Decorativas
- Funcionales
- Juguetes y Modelos
- Accesorios para Impresora

**Productos de Ejemplo:**
- Busto de David (45.99€)
- Lámpara Geométrica (32.50€)
- Maceta Hexagonal (18.99€)
- Organizador de Escritorio (24.99€)
- Y muchos más...

**Clientes de Ejemplo:**
- juan@example.com (contraseña: password123)
- maria@example.com (contraseña: password456)
- carlos@example.com (contraseña: password789)

## 🔐 Seguridad

- Las contraseñas se hashean con bcrypt
- CORS configurado (modificar en producción)
- Validación de datos con Pydantic
- Consultas paramétrizadas para evitar SQL injection

## 📝 Ejemplos de Uso

### Crear un producto
```bash
curl -X POST "http://localhost:8000/productos/" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Producto",
    "descripcion": "Descripción",
    "precio": 29.99,
    "categoria_id": 1,
    "material": "PLA",
    "stock": 10
  }'
```

### Crear un pedido
```bash
curl -X POST "http://localhost:8000/pedidos/?cliente_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "direccion_envio": "Calle Principal 123",
    "items": [
      {"producto_id": 1, "cantidad": 2},
      {"producto_id": 3, "cantidad": 1}
    ]
  }'
```

### Registrar un cliente
```bash
curl -X POST "http://localhost:8000/clientes/registro" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "nombre": "Nombre",
    "apellido": "Apellido",
    "contraseña": "password_seguro",
    "telefono": "+34123456789",
    "ciudad": "Madrid"
  }'
```

## 🐳 Comandos Docker Útiles

```bash
# Ver logs de la aplicación
docker-compose logs -f api

# Ver logs de la base de datos
docker-compose logs -f db

# Ejecutar comandos en el contenedor
docker-compose exec api bash

# Detener todos los contenedores
docker-compose down

# Detener e limpiar volúmenes (¡CUIDADO: borra datos!)
docker-compose down -v

# Reconstruir los contenedores
docker-compose build --no-cache
```

## 📊 Próximas Mejoras

- [ ] Autenticación JWT completa
- [ ] Pasarela de pagos (Stripe, PayPal)
- [ ] Sistema de reseñas y comentarios
- [ ] Carrito de compra persistente
- [ ] Notificaciones por email
- [ ] Panel de administrador
- [ ] Sistema de cupones y descuentos
- [ ] Búsqueda y filtrado avanzado
- [ ] Tests unitarios e integración
- [ ] Logs y monitoreo

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes, abre un issue primero.

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 📧 Soporte

Para preguntas o problemas, contacta a través de:
- Issues en el repositorio
- Email: tu-email@example.com

---

**Hecho con ❤️ para vendedores de productos impresos en 3D**