# ✂️ Barbería Krono

Sistema de gestión de barbería — Citas, Barberos, Servicios y Horarios.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL + SQLAlchemy |
| Orquestación | Docker Compose |

## 📁 Estructura

```
barberia_krono/
├── backend/          # FastAPI REST API
├── frontend/         # React + Vite
├── database/         # Scripts SQL iniciales
└── docker-compose.yml
```

## ⚡ Levantar el proyecto

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Docs API: http://localhost:8000/docs

## 🗄️ Variables de entorno

Copia `.env.example` a `.env` y configura tus variables.

```bash
cp .env.example .env
```
