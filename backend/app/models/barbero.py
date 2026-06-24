import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Barbero(Base):
    __tablename__ = "barberos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    foto_url = Column(String(300), nullable=True)
    silla_id = Column(UUID(as_uuid=True), ForeignKey("sillas.id"), nullable=True)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    silla = relationship("Silla")
    horarios = relationship("HorarioBarbero", back_populates="barbero", cascade="all, delete")
    citas = relationship("Cita", back_populates="barbero")
