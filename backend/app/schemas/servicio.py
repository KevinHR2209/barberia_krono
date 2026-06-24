from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime


class ServicioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    duracion_minutos: int = 30
    precio: Decimal
    activo: bool = True


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    duracion_minutos: Optional[int] = None
    precio: Optional[Decimal] = None
    activo: Optional[bool] = None


class ServicioOut(ServicioBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
