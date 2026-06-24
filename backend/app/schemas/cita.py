from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, time, datetime
from app.schemas.cliente import ClienteOut
from app.schemas.barbero import BarberoOut
from app.schemas.servicio import ServicioOut


class CitaBase(BaseModel):
    cliente_id: UUID
    barbero_id: UUID
    servicio_id: UUID
    silla_id: Optional[UUID] = None
    fecha: date
    hora_inicio: time
    notas: Optional[str] = None


class CitaCreate(CitaBase):
    pass


class CitaUpdateEstado(BaseModel):
    estado: str  # asignada | completada | cancelada


class CitaOut(BaseModel):
    id: UUID
    fecha: date
    hora_inicio: time
    hora_fin: time
    estado: str
    notas: Optional[str]
    created_at: datetime
    cliente: ClienteOut
    barbero: BarberoOut
    servicio: ServicioOut

    class Config:
        from_attributes = True
