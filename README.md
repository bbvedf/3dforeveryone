# 💎 3D4EVERYONE - Full-Stack 3D Store

Aplicación profesional y moderna para gestionar una tienda online de productos impresos en 3D. Este proyecto utiliza una arquitectura desacoplada con **FastAPI** en el backend y **React (Vite)** en el frontend, orquestado completamente con **Docker**.

## 🚀 Características Actuales

### 🛍️ Tienda y Experiencia de Compra
- **🛒 Carrito Persistente**: CartDrawer lateral con ajuste de cantidades, eliminación de ítems y total dinámico. Se abre automáticamente al añadir un producto. Persiste en `localStorage`.
- **💳 Checkout Completo**: Formulario de envío pre-rellenado con datos del perfil, resumen de pedido y confirmación con modal centrado (React Portal).
- **📦 Historial de Pedidos**: Vista detallada de todos los pedidos del usuario con líneas de producto (nombre, material, cantidad × precio unitario), subtotales, dirección de envío y estado visual con badge y color.

### 🔐 Autenticación y Usuarios
- **JWT con roles**: Sistema de autenticación basado en tokens con roles `admin` y `cliente`.
- **Registro con validación**: Formulario completo con checkers en tiempo real (contraseñas coincidentes, email, campos requeridos). Modal de confirmación al registrarse.
- **Perfil editable**: Actualización de datos personales y cambio seguro de contraseña (hashing servidor).

### 🗂️ Catálogo y Navegación
- **Motor de búsqueda**: Filtrado en tiempo real por nombre y categoría en el catálogo principal.
- **Vista de Detalle de Producto (`/producto/:id`)**: Página dedicada con foto a gran tamaño, precio, stock en tiempo real, metadatos (material, ID) y un selector avanzado para añadir múltiples cantidades al carrito con un solo click.
- **Categorías navegables**: Vista pública de categorías activas.
- **Navbar adaptativa**: Links dinámicos según rol (cliente/admin), icono de carrito con contador de ítems, menú lateral hamburguesa.
- **Modo Claro/Oscuro**: Toggle persistente con transición suave y favicon dinámico.

### 🛠️ Panel de Administración
- **📋 Listados Unificados**: Las tablas de Inventario, Categorías, Pedidos y Clientes cuentan con filtros tipo Excel, paginación integrada, ordenación interactiva por cabecera y búsqueda robusta independiente de tildes o acentos (vía PostgreSQL `unaccent`).
- **🛒 Gestión de Pedidos**: Tabla global con filas **acordeón expandibles** (click para ver líneas detalladas del pedido, dirección y notas). Cambio de estado con selector visual.
- **👥 Directorio de Clientes**: Dos etapas de baja — **Desactivar** (soft delete, conserva pedidos) → el cliente aparece como *Inactivo* → **Eliminar definitivamente** (hard delete de BD).
- **🖼️ Gestión de Medios**: Subida y visualización de fotos de productos y avatares dinámicos (servidos vía Vite Proxy con prevención de caché en el navegador usando sufijos UUID).

### 💳 Pagos con Stripe
- **✅ Sesiones de Checkout**: Integración con Stripe Checkout para pagos seguros con tarjeta.
- **✅ Webhooks de Confirmación**: Actualización automática del estado de pedidos (PENDIENTE → CONFIRMADO) mediante webhooks de Stripe en tiempo real.
- **✅ Desarrollo Seguro**: Stripe CLI configurado para túneling local y validación de firmas de webhook.

### 🏗️ Infraestructura y Calidad
- **🔌 API Robusta**: FastAPI con validación Pydantic v2, ORM SQLAlchemy 2.0, respuestas enriquecidas (items de pedido incluyen datos del producto y cliente).
- **🎨 Frontend Premium**: React 19 + Vite, glassmorphism, micro-animaciones, dark mode. Modales con React Portals para centrado perfecto.
- **🛡️ Rutas Protegidas**: `ProtectedRoute` con soporte `adminOnly` para bloquear acceso según rol.
- **📐 Esquemas enlazados**: `ItemPedido` devuelve el objeto `Producto` anidado, `PedidoResponse` devuelve el `Cliente` anidado.

---

## 🏗️ Arquitectura del Proyecto

```text
3dforeveryone/
├── app/                    # Backend API (FastAPI)
│   ├── routes/
│   │   ├── auth.py         # Login / JWT
│   │   ├── clientes.py     # CRUD clientes + soft/hard delete
│   │   ├── productos.py    # CRUD productos
│   │   ├── categorias.py   # CRUD categorías
│   │   └── pedidos.py      # Pedidos: crear, listar, cancelar, actualizar estado
│   ├── models.py           # Modelos SQLAlchemy (Pedido, ItemPedido, Cliente, …)
│   ├── schemas.py          # Schemas Pydantic v2 con relaciones anidadas
│   ├── security.py         # JWT, hashing, guards de rol
│   └── database.py         # Conexión PostgreSQL
├── frontend/               # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── api/            # Cliente Axios con interceptores JWT + 401
│   │   ├── context/        # AuthContext, CartContext, ThemeContext
│   │   ├── components/     # Navbar, CartDrawer, ConfirmModal (Portal), ProtectedRoute
│   │   └── pages/
│   │       ├── Catalog.jsx
│   │       ├── ProductDetail.jsx
│   │       ├── Checkout.jsx
│   │       ├── Orders.jsx
│   │       ├── Profile.jsx
│   │       ├── Login.jsx / Register.jsx
│   │       └── admin/
│   │           ├── AdminProducts.jsx
│   │           ├── AdminCategories.jsx
│   │           ├── AdminOrders.jsx   # Acordeón + cambio estado
│   │           └── AdminClients.jsx  # Soft/Hard delete
│   └── Dockerfile
├── database/               # Scripts de inicialización y seed
├── .env                    # Variables de entorno (NO subido a Git)
└── docker-compose.yml
```

---

## 🛠️ Instalación y Arranque Rápido

### 1. Preparar entorno
```bash
cp .env.example .env
```

### 2. Levantar el stack completo
```bash
docker-compose up -d --build
```

### 3. Semilla de datos (Opcional)
```bash
docker-compose exec api python -m database.init_db
```

### 4. Configurar Stripe para desarrollo (Webhooks automáticos)
Si quieres probar pagos con actualizaciones automáticas de estado:

```bash
# Instalar Stripe CLI (si no lo tienes)
# https://stripe.com/docs/stripe-cli

# Autenticarse con tu cuenta Stripe
stripe login

# En una terminal nueva, iniciar el túnel de webhooks
stripe listen --forward-to http://localhost:8000/stripe/webhook

# El CLI mostrará el webhook signing secret (whsec_xxx)
# Cópialo y actualiza en tu .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Esto permite que los webhooks de Stripe lleguen a tu servidor local de desarrollo y actualicen automáticamente los pedidos cuando el pago se completa.

---

## 🔑 Credenciales de Prueba

### Administrador
- **Email:** `admin@3dforeveryone.com`
- **Password:** `Admin3D2024!`

### Cliente
- **Email:** `juan@example.com`
- **Password:** `password123`

---

## 🔌 Accesos Directos

| Servicio | URL |
| :--- | :--- |
| **🚀 Tienda** | [http://localhost:5173](http://localhost:5173) |
| **🛒 Mis Pedidos** | [http://localhost:5173/mis-pedidos](http://localhost:5173/mis-pedidos) |
| **⚙️ Admin — Inventario** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **🛠️ Admin — Pedidos** | [http://localhost:5173/admin/pedidos](http://localhost:5173/admin/pedidos) |
| **👥 Admin — Clientes** | [http://localhost:5173/admin/clientes](http://localhost:5173/admin/clientes) |
| **📚 Swagger API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 📊 Roadmap y Estado del Proyecto

- [x] **Catálogo y Categorías**: CRUD completo con filtros y búsqueda (✅)
- [x] **Autenticación JWT y Roles**: Login, registro, perfil editable (✅)
- [x] **Carrito de Compra**: Drawer lateral persistente, ajuste de cantidades (✅)
- [x] **Checkout y Pedidos**: Formulario de envío, confirmación, historial detallado (✅)
- [x] **Panel Admin — Pedidos**: Acordeón con detalle, cambio de estado logístico (✅)
- [x] **Panel Admin — Clientes**: Directorio completo con soft/hard delete (✅)
- [x] **Panel Admin — Interfaz Unificada**: Búsqueda global (unaccent), ordenación reactiva y paginación en todas las tablas (✅)
- [x] **Imágenes y Multimedia**: Subida nativa de imágenes físicas (Pillow) con proxy local (✅)
- [x] **Vistas de Producto**: Página de detalles individual con gestión de múltiples unidades y stock en tiempo real (✅)
- [x] **Pasarela de Pagos**: ✅ Stripe Checkout + Webhooks automáticos para confirmar pedidos
- [ ] **Notificaciones**: Emails transaccionales (confirmación de pedido, envío)
- [ ] **Seguimiento**: Tracking público de pedido por número

---

**Hecho con ❤️ para la comunidad Maker 3D**