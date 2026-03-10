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

### 💳 Pasarelas de Pago
- **✅ Stripe Checkout**: Integración con Stripe para pagos seguros con tarjeta y Apple/Google Pay.
- **✅ PayPal Smart Buttons**: Integración nativa de PayPal con soporte para saldo, cuenta bancaria y pago financiado.
- **✅ Webhooks de Confirmación**: Actualización automática del estado de pedidos (PENDIENTE → CONFIRMADO) mediante webhooks de Stripe y callbacks de PayPal en tiempo real.
- **✅ Desarrollo Seguro**: Client-side SDKs con backend validation para evitar fraudes.

### 📧 Sistema de Emails Transaccionales
- **✅ FastAPI-Mail**: Servicio centralizado de envío de emails con plantillas HTML profesionales.
- **✅ MailHog (Desarrollo)**: Servidor SMTP mock local para capturar y visualizar emails sin enviar realmente (Web UI en [http://localhost:8025](http://localhost:8025)).
- **✅ Tres tipos de emails automáticos**:
  - **Bienvenida**: Enviado al registrarse el usuario con información de cuenta y CTA al catálogo.
  - **Confirmación de Pedido**: Enviado tras pago exitoso vía webhook de Stripe con resumen detallado, ítems, total y dirección de envío.
  - **Notificación de Envío**: Disparado por admin al cambiar estado a "ENVIADO" con número de seguimiento, dirección, timeline de estados y estimación de entrega.
- **✅ Diseño Premium**: Templates HTML con esquema de colores oscuro (#1e293b), acentos azules (#3a86ff), logo de empresa a 300px y tipografía profesional.
- **✅ Integración Completa**: Linkado con rutas de registro, webhook de Stripe y endpoint admin de cambio de estado (`PUT /stripe/admin-change-status/{pedido_id}/{nuevo_estado}`).

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
│   ├── email_service.py    # FastAPI-Mail: 3 templates HTML + funciones de envío
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

### 5. Visualizar Emails (MailHog)
El sistema de emails ya está configurado para usar **MailHog** en desarrollo, que es un servidor SMTP mock que captura todos los emails sin enviarlos realmente.

**Accede al Web UI de MailHog:**
- 🔗 [http://localhost:8025](http://localhost:8025)

Los emails de bienvenida, confirmación de pedido y notificación de envío aparecerán aquí automáticamente cuando ocurran los eventos correspondientes (signup, pago, cambio de estado a "ENVIADO").

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
| **📧 MailHog — Emails de Prueba** | [http://localhost:8025](http://localhost:8025) |

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
- [x] **Pasarela de Pagos**: ✅ Stripe Checkout + PayPal Smart Buttons con confirmación automática.
- [x] **Notificaciones por Email**: ✅ Emails transaccionales (bienvenida, pedido, envío) con FastAPI-Mail.
- [ ] **Pre-Producción**: 🚀 Nginx, HTTPS (SSL) y securización de cabeceras.
- [ ] **Seguimiento**: Tracking público de pedido por número.

---

---

## ⚙️ Configuración de Variables de Entorno (.env)

### Base de Datos
```env
DATABASE_URL=postgresql://user:password@db:5432/3dforeveryone
```

### JWT y Seguridad
```env
SECRET_KEY=tu-clave-secreta-super-segura
ALGORITHM=HS256
```

### Stripe
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### PayPal
```env
PAYPAL_CLIENT_ID=ATo_...
PAYPAL_CLIENT_SECRET=EK_...
PAYPAL_MODE=sandbox        # 'sandbox' o 'live'
```

### Emails (FastAPI-Mail + MailHog)
```env
# SMTP Configuration (Desarrollo con MailHog)
SMTP_HOST=mailhog          # En producción: smtp.gmail.com, Sendgrid, etc.
SMTP_PORT=1025             # En producción: 587 o 465
SMTP_USER=test@example.com
SMTP_PASSWORD=test
SENDER_EMAIL=noreply@3dforeveryone.com
SENDER_NAME=3D For Everyone
```

**Nota:** En producción, reemplaza MailHog con un servicio real como Gmail, SendGrid, AWS SES o similar. Solo cambia `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASSWORD`.

---

**Hecho con ❤️ para la comunidad Maker 3D**