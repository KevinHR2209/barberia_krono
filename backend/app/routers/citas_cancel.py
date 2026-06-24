"""Endpoint JSON para cancelar cita por token (usado por el frontend React)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.cita import Cita

router = APIRouter()


@router.post("/cancelar/{token}")
def cancelar_por_token_json(token: str, db: Session = Depends(get_db)):
    cita = db.query(Cita).options(
        joinedload(Cita.cliente),
        joinedload(Cita.servicio),
    ).filter(Cita.cancel_token == token).first()

    if not cita:
        raise HTTPException(status_code=404, detail="Token inválido o ya utilizado")
    if cita.estado == "cancelada":
        return {"ok": True, "mensaje": "La cita ya estaba cancelada"}
    if cita.estado == "completada":
        raise HTTPException(status_code=400, detail="La cita ya fue completada y no puede cancelarse")

    cita.estado = "cancelada"
    cita.cancel_token = None
    db.commit()
    return {"ok": True, "mensaje": "Cita cancelada exitosamente"}
