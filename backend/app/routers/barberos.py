from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.barbero import Barbero
from app.schemas.barbero import BarberoCreate, BarberoUpdate, BarberoOut

router = APIRouter()


@router.get("/", response_model=List[BarberoOut])
def listar_barberos(db: Session = Depends(get_db)):
    return db.query(Barbero).filter(Barbero.activo == True).all()


@router.post("/", response_model=BarberoOut, status_code=201)
def crear_barbero(data: BarberoCreate, db: Session = Depends(get_db)):
    barbero = Barbero(**data.model_dump())
    db.add(barbero)
    db.commit()
    db.refresh(barbero)
    return barbero


@router.get("/{barbero_id}", response_model=BarberoOut)
def obtener_barbero(barbero_id: UUID, db: Session = Depends(get_db)):
    barbero = db.query(Barbero).filter(Barbero.id == barbero_id).first()
    if not barbero:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    return barbero


@router.patch("/{barbero_id}", response_model=BarberoOut)
def actualizar_barbero(barbero_id: UUID, data: BarberoUpdate, db: Session = Depends(get_db)):
    barbero = db.query(Barbero).filter(Barbero.id == barbero_id).first()
    if not barbero:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(barbero, key, value)
    db.commit()
    db.refresh(barbero)
    return barbero


@router.delete("/{barbero_id}", status_code=204)
def eliminar_barbero(barbero_id: UUID, db: Session = Depends(get_db)):
    barbero = db.query(Barbero).filter(Barbero.id == barbero_id).first()
    if not barbero:
        raise HTTPException(status_code=404, detail="Barbero no encontrado")
    barbero.activo = False
    db.commit()
