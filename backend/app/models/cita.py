import uuid
from sqlalchemy import Column, String, Date, Time, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Cita(Base):
    __tablename__ = "citas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    barbero_id = Column(UUID(as_uuid=True), ForeignKey("barberos.id", ondelete="CASCADE"), nullable=False)
    servicio_id = Column(UUID(as_uuid=True), ForeignKey("servicios.id", ondelete="CASCADE"), nullable=False)
    silla_id = Column(UUID(as_uuid=True), ForeignKey("sillas.id", ondelete="SET NULL"), nullable=True)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    estado = Column(String(20), nullable=False, default="asignada")  # asignada | completada | cancelada
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cliente = relationship("Cliente")
    barbero = relationship("Barbero", back_populates="citas")
    servicio = relationship("Servicio")
    silla = relationship("Silla")
