# 💎 3D4EVERYONE - Full-Stack 3D Store

Aplicación profesional y moderna para gestionar una tienda online de productos impresos en 3D. Este proyecto utiliza una arquitectura desacoplada con **FastAPI** en el backend y **React (Vite)** en el frontend, orquestado completamente con **Docker**.

## 🚀 Características Actuales

- **🔐 Seguridad Avanzada**: Autenticación basada en JWT (JSON Web Tokens) con sistema de roles (Admin y Cliente).
- **🎨 Frontend Premium**: Interfaz moderna con estética *Dark Mode* y *Glassmorphism* construida con React 19 y Vite.
- **🔌 API Robusta**: Backend con FastAPI, validación de datos Pydantic v2 y ORM SQLAlchemy 2.0.
- **🗂️ Gestión de Catálogo**: CRUD completo de productos y categorías con filtrado dinámico.
- **📦 Pedidos Inteligentes**: Sistema de pedidos con control de stock automático y gestión de estados.
- **🐳 Dockerizado**: Despliegue en un solo comando con contenedores para DB, API y UI.

---

## 🏗️ Arquitectura del Proyecto

```text
3dforeveryone/
├── app/                # Backend API (FastAPI)
│   ├── routes/         # Endpoints (Categorías, Productos, Clientes, Pedidos, Auth)
│   ├── models.py       # Modelos de Base de Datos (SQLAlchemy)
│   ├── schemas.py      # Validaciones y esquemas (Pydantic)
│   ├── security.py     # Lógica de JWT, Hashing y Roles
│   └── database.py     # Configuración de conexión PostgreSQL
├── frontend/           # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/        # Cliente Axios centralizado con Interceptores
│   │   ├── context/    # Estado global de Autenticación
│   │   ├── components/ # Componentes UI (Navbar, etc.)
│   │   └── pages/      # Páginas (Catálogo, Login, Admin)
│   └── Dockerfile      # Docker para React (Node 22)
├── database/           # Scripts de inicialización
├── .env                # Variables de entorno (NO subido a Git)
└── docker-compose.yml  # Orquestador de la infraestructura
```

---

## 🛠️ Instalación y Arranque Rápido

### 1. Clonar el repositorio y configurar entorno
```bash
cp .env.example .env
# El archivo .env ya viene pre-configurado con credenciales de desarrollo
```

### 2. Levantar el Stack completo con Docker
```bash
docker-compose up -d --build
```
*Este comando arrancará la Base de Datos, la API de FastAPI y el Frontend de React.*

### 3. Inicializar la Base de Datos con Datos de Ejemplo
```bash
docker-compose exec api python -m database.init_db
```

---

## 🔑 Credenciales de Prueba

### Perfil Administrador
- **Email:** `admin@3dforeveryone.com`
- **Password:** `Admin3D2024!`

### Perfil Cliente
- **Email:** `juan@example.com`
- **Password:** `password123`

---

## 🔌 Accesos Directos

| Servicio | URL |
| :--- | :--- |
| **🚀 Tienda (Frontend)** | [http://localhost:5173](http://localhost:5173) |
| **📚 Documentación Swagger** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **🗄️ API Healthcheck** | [http://localhost:8000/health](http://localhost:8000/health) |

---

## 📊 Roadmap de Próximas Mejoras

- [ ] **Admin Panel**: CRUD visual de productos para administradores.
- [ ] **Carrito de Compra**: Gestión de items y persistencia en sesión.
- [ ] **Subida de Imágenes**: Soporte para fotos reales de las piezas 3D.
- [ ] **Pasarela de Pagos**: Integración con Stripe o PayPal.
- [ ] **Búsqueda**: Filtros avanzados por material, precio y categoría.

---

**Hecho con ❤️ para la comunidad Maker 3D**