from sqlalchemy.orm import Session
from .models.silla import Silla
from .models.barbero import Barbero
from .models.horario import HorarioBarbero
from .models.servicio import Servicio


def run_seed(db: Session):
    # Sillas
    if db.query(Silla).count() == 0:
        for n in [1, 2, 3]:
            db.add(Silla(numero=n, activa=True))
        db.commit()

    sillas = db.query(Silla).order_by(Silla.numero).all()

    # Barberos
    if db.query(Barbero).count() == 0:
        barberos_data = [
            dict(nombre='Matías',    apellido='Rojas',   email='matias.rojas@kronobarberia.cl',    telefono='+56912345601', silla_id=sillas[0].id),
            dict(nombre='Sebastián', apellido='Fuentes', email='sebastian.fuentes@kronobarberia.cl', telefono='+56912345602', silla_id=sillas[1].id),
            dict(nombre='Nicolás',   apellido='Herrera', email='nicolas.herrera@kronobarberia.cl',  telefono='+56912345603', silla_id=sillas[2].id),
        ]
        for bd in barberos_data:
            db.add(Barbero(**bd, activo=True))
        db.commit()

    # Horarios Lunes(0) a Sábado(5)
    if db.query(HorarioBarbero).count() == 0:
        barberos = db.query(Barbero).all()
        for b in barberos:
            for dia in range(6):
                db.add(HorarioBarbero(
                    barbero_id=b.id,
                    dia_semana=dia,
                    hora_inicio='09:00:00',
                    hora_fin='19:00:00'
                ))
        db.commit()

    # Servicios
    if db.query(Servicio).count() == 0:
        servicios_data = [
            dict(nombre='Corte Clásico',        descripcion='Corte de cabello clásico con tijera y máquina, acabado prolijo.',          duracion_minutos=30, precio=8000),
            dict(nombre='Corte + Barba',         descripcion='Combo completo: corte de cabello y arreglo de barba con navaja.',          duracion_minutos=50, precio=13000),
            dict(nombre='Arreglo de Barba',      descripcion='Perfilado y arreglo de barba con navaja caliente y toalla húmeda.',        duracion_minutos=25, precio=6000),
            dict(nombre='Afeitado Clásico',      descripcion='Afeitado tradicional con navaja, espuma caliente y toalla húmeda.',       duracion_minutos=30, precio=7000),
            dict(nombre='Corte Degradado',       descripcion='Fade o degradado a máquina con acabado de tijera en la parte superior.',  duracion_minutos=40, precio=10000),
            dict(nombre='Tinte de Barba',        descripcion='Coloración de barba con tinte profesional. Incluye hidratación.',         duracion_minutos=35, precio=9000),
            dict(nombre='Keratina Exprés',       descripcion='Tratamiento de keratina exprés para alisar y nutrir el cabello.',         duracion_minutos=60, precio=18000),
            dict(nombre='Diseño de Cejas',       descripcion='Depilación y perfilado de cejas con hilo y pinzas.',                      duracion_minutos=15, precio=4000),
            dict(nombre='Lavado + Hidratación',  descripcion='Lavado profundo con champú profesional y mascarilla hidratante.',         duracion_minutos=20, precio=5000),
            dict(nombre='Corte Infantil',        descripcion='Corte de cabello para niños hasta 12 años, ambiente amigable.',           duracion_minutos=25, precio=6000),
        ]
        for sd in servicios_data:
            db.add(Servicio(**sd, activo=True))
        db.commit()
