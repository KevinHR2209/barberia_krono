import uuid
from sqlalchemy import Column, String, Text, Integer, Numeric, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Servicio(Base):
    __tablename__ = "servicios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    duracion_minutos = Column(Integer, nullable=False, default=30)
    precio = Column(Numeric(10, 2), nullable=False, default=0)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
