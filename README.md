# 💎 3D4EVERYONE - Full-Stack 3D Store

Aplicación profesional y moderna para gestionar una tienda online de productos impresos en 3D. Este proyecto utiliza una arquitectura desacoplada con **FastAPI** en el backend y **React (Vite)** en el frontend, orquestado completamente con **Docker**.

## 🚀 Características Actuales

- **🔐 Seguridad Avanzada**: Autenticación basada en JWT (JSON Web Tokens) con sistema de roles (Admin y Cliente).
- **🎨 Frontend Premium**: Interfaz moderna con estética *Dark Mode* y *Glassmorphism* construida con React 19 y Vite.
- **🔌 API Robusta**: Backend con FastAPI, validación de datos Pydantic v2 y ORM SQLAlchemy 2.0.
- **🗂️ Gestión de Catálogo Pro**: CRUD avanzado de productos y categorías con búsqueda en tiempo real, filtros tipo Excel, paginación y ordenación dinámica.
- **🛡️ Integridad de Datos**: Sistema de borrado inteligente (soft/hard delete) con validación de dependencias entre productos y categorías.

---

## 🏗️ Arquitectura del Proyecto

```text
3dforeveryone/
├── app/                # Backend API (FastAPI)
│   ├── routes/         # Endpoints (Categorías, Productos, Usuarios, Auth)
│   ├── models.py       # Modelos de Base de Datos (SQLAlchemy 2.0)
│   ├── schemas.py      # Validaciones y esquemas (Pydantic v2)
│   ├── security.py     # Lógica de JWT, Hashing y Roles
│   └── database.py     # Configuración de conexión PostgreSQL
├── frontend/           # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── api/        # Cliente Axios centralizado con Interceptores
│   │   ├── components/ # Modales Premium, Navbar, ProtectedRoutes
│   │   └── pages/      # Catálogo, Admin (Productos/Categorías), Auth
│   └── Dockerfile      # Docker para React (Node 22)
├── database/           # Scripts de inicialización
├── .env                # Variables de entorno (NO subido a Git)
└── docker-compose.yml  # Orquestador de la infraestructura
```

---

## 🛠️ Instalación y Arranque Rápido

### 1. Preparar Entorno
```bash
cp .env.example .env
```

### 2. Levantar el Stack Completo
```bash
docker-compose up -d --build
```

### 3. Semilla de Datos (Opcional)
```bash
docker-compose exec api python -m database.init_db
```

---

## 🔑 Credenciales de Prueba

### Perfil Administrador
- **Email:** `admin@3dforeveryone.com`
- **Password:** `Admin3D2024!` (Acceso a Panel de Control)

### Perfil Cliente
- **Email:** `juan@example.com`
- **Password:** `password123`

---

## 🔌 Accesos Directos

| Servicio | URL |
| :--- | :--- |
| **🚀 Tienda (Frontend)** | [http://localhost:5173](http://localhost:5173) |
| **💠 Gestión Inventario** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **📚 Docs Swagger** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 📊 Roadmap y Estado del Proyecto

- [x] **Módulo de Administración**: Gestión avanzada de inventario y categorías (Completado ✅)
- [x] **Filtros y Búsqueda**: Motor de búsqueda dinámico y filtros Excel-style (Completado ✅)
- [ ] **Registro y Perfil**: Flujo completo de registro de nuevos usuarios y edición de perfil.
- [ ] **Gestión de Imágenes**: Sistema de carga y visualización de archivos para modelos 3D.
- [ ] **Carrito de Compra**: Gestión de items y persistencia.
- [ ] **Pasarela de Pagos**: Integración real con Stripe.

---

**Hecho con ❤️ para la comunidad Maker 3D**