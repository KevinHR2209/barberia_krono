from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.cita import Cita
from app.schemas.cita import CitaCreate, CitaUpdateEstado, CitaOut
from app.services.cita_service import crear_cita

router = APIRouter()


@router.get("/", response_model=List[CitaOut])
def listar_citas(db: Session = Depends(get_db)):
    return db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).order_by(Cita.fecha, Cita.hora_inicio).all()


@router.get("/barbero/{barbero_id}", response_model=List[CitaOut])
def citas_por_barbero(barbero_id: UUID, db: Session = Depends(get_db)):
    return db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).filter(
        Cita.barbero_id == barbero_id,
        Cita.estado != "cancelada",
    ).order_by(Cita.fecha, Cita.hora_inicio).all()


@router.post("/", response_model=CitaOut, status_code=201)
def nueva_cita(data: CitaCreate, db: Session = Depends(get_db)):
    return crear_cita(db, data)


@router.patch("/{cita_id}/estado", response_model=CitaOut)
def cambiar_estado_cita(cita_id: UUID, data: CitaUpdateEstado, db: Session = Depends(get_db)):
    cita = db.query(Cita).filter(Cita.id == cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    estados_validos = ["asignada", "completada", "cancelada"]
    if data.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Debe ser uno de: {estados_validos}")
    cita.estado = data.estado
    db.commit()
    db.refresh(cita)
    return cita


@router.get("/{cita_id}", response_model=CitaOut)
def obtener_cita(cita_id: UUID, db: Session = Depends(get_db)):
    cita = db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.barbero),
        joinedload(Cita.servicio),
    ).filter(Cita.id == cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return cita
