from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.horario_barbero import HorarioBarbero
from app.schemas.horario import HorarioCreate, HorarioUpdate, HorarioOut

router = APIRouter()


@router.get("/barbero/{barbero_id}", response_model=List[HorarioOut])
def horarios_por_barbero(barbero_id: UUID, db: Session = Depends(get_db)):
    return db.query(HorarioBarbero).filter(HorarioBarbero.barbero_id == barbero_id).all()


@router.post("/", response_model=HorarioOut, status_code=201)
def crear_horario(data: HorarioCreate, db: Session = Depends(get_db)):
    horario = HorarioBarbero(**data.model_dump())
    db.add(horario)
    db.commit()
    db.refresh(horario)
    return horario


@router.patch("/{horario_id}", response_model=HorarioOut)
def actualizar_horario(horario_id: UUID, data: HorarioUpdate, db: Session = Depends(get_db)):
    horario = db.query(HorarioBarbero).filter(HorarioBarbero.id == horario_id).first()
    if not horario:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(horario, key, value)
    db.commit()
    db.refresh(horario)
    return horario


@router.delete("/{horario_id}", status_code=204)
def eliminar_horario(horario_id: UUID, db: Session = Depends(get_db)):
    horario = db.query(HorarioBarbero).filter(HorarioBarbero.id == horario_id).first()
    if not horario:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    db.delete(horario)
    db.commit()
