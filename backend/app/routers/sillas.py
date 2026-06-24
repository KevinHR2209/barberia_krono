from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.silla import Silla
from app.schemas.silla import SillaCreate, SillaUpdate, SillaOut

router = APIRouter()


@router.get("/", response_model=List[SillaOut])
def listar_sillas(db: Session = Depends(get_db)):
    return db.query(Silla).all()


@router.post("/", response_model=SillaOut, status_code=201)
def crear_silla(data: SillaCreate, db: Session = Depends(get_db)):
    silla = Silla(**data.model_dump())
    db.add(silla)
    db.commit()
    db.refresh(silla)
    return silla


@router.get("/{silla_id}", response_model=SillaOut)
def obtener_silla(silla_id: UUID, db: Session = Depends(get_db)):
    silla = db.query(Silla).filter(Silla.id == silla_id).first()
    if not silla:
        raise HTTPException(status_code=404, detail="Silla no encontrada")
    return silla


@router.patch("/{silla_id}", response_model=SillaOut)
def actualizar_silla(silla_id: UUID, data: SillaUpdate, db: Session = Depends(get_db)):
    silla = db.query(Silla).filter(Silla.id == silla_id).first()
    if not silla:
        raise HTTPException(status_code=404, detail="Silla no encontrada")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(silla, key, value)
    db.commit()
    db.refresh(silla)
    return silla


@router.delete("/{silla_id}", status_code=204)
def eliminar_silla(silla_id: UUID, db: Session = Depends(get_db)):
    silla = db.query(Silla).filter(Silla.id == silla_id).first()
    if not silla:
        raise HTTPException(status_code=404, detail="Silla no encontrada")
    db.delete(silla)
    db.commit()
