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
# Clonar
git clone https://github.com/KevinHR2209/barberia_krono.git
cd barberia_krono

# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env

# Levantar
docker-compose up --build
```

- Frontend: http://localhost:5173
- Portal de Reservas (público): http://localhost:5173/reservar
- Backend API docs: http://localhost:8000/docs

## 📊 Datos precargados

- 3 Sillas
- 3 Barberos (uno por silla) con horario Lun-Sáb 09:00-19:00
- 10 Servicios

## 🔗 Integración con Krono

Este sistema usa la misma base de datos PostgreSQL que [Krono](https://github.com/KevinHR2209/Krono).
Para integrar, apunta `DATABASE_URL` a la instancia de Krono.
