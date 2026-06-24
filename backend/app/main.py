from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.routers import barberos, clientes, citas, servicios, sillas, horarios
from app.routers import citas_cancel
from app.seed import run_seed

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# Cargar datos semilla
db = SessionLocal()
try:
    run_seed(db)
finally:
    db.close()

app = FastAPI(
    title="Barbería Krono API",
    description="API REST para gestión de citas, barberos y servicios de barbería",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(sillas.router, prefix="/api/sillas", tags=["Sillas"])
app.include_router(barberos.router, prefix="/api/barberos", tags=["Barberos"])
app.include_router(horarios.router, prefix="/api/horarios", tags=["Horarios"])
app.include_router(servicios.router, prefix="/api/servicios", tags=["Servicios"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(citas.router, prefix="/api/citas", tags=["Citas"])
app.include_router(citas_cancel.router, prefix="/api/citas", tags=["Cancelación"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Barbería Krono API"}
