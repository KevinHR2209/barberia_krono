from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.servicio import Servicio
from app.schemas.servicio import ServicioCreate, ServicioUpdate, ServicioOut

router = APIRouter()


@router.get("/", response_model=List[ServicioOut])
def listar_servicios(db: Session = Depends(get_db)):
    return db.query(Servicio).filter(Servicio.activo == True).all()


@router.post("/", response_model=ServicioOut, status_code=201)
def crear_servicio(data: ServicioCreate, db: Session = Depends(get_db)):
    servicio = Servicio(**data.model_dump())
    db.add(servicio)
    db.commit()
    db.refresh(servicio)
    return servicio


@router.get("/{servicio_id}", response_model=ServicioOut)
def obtener_servicio(servicio_id: UUID, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio


@router.patch("/{servicio_id}", response_model=ServicioOut)
def actualizar_servicio(servicio_id: UUID, data: ServicioUpdate, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(servicio, key, value)
    db.commit()
    db.refresh(servicio)
    return servicio


@router.delete("/{servicio_id}", status_code=204)
def eliminar_servicio(servicio_id: UUID, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    servicio.activo = False
    db.commit()
