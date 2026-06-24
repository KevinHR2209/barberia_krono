import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import date

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _html_confirmacion(datos: dict) -> str:
    cancel_url = f"{FRONTEND_URL}/cancelar/{datos['cancel_token']}"
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f0f4ff;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,138,0.1);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1d4ed8,#1e3a8a);padding:32px 40px;text-align:center;">
                <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 16px;margin-bottom:12px;">
                  <span style="color:#fff;font-size:28px;">✂</span>
                </div>
                <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px;">KRONO Barbería</h1>
                <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Confirmación de reserva</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 40px;">
                <h2 style="color:#1e3a8a;font-size:20px;margin:0 0 8px;">¡Hola, {datos['cliente_nombre']}! 👋</h2>
                <p style="color:#64748b;margin:0 0 28px;font-size:15px;">Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;padding:4px;">
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Barbero</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['barbero']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Servicio</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['servicio']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Fecha</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['fecha']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;border-bottom:1px solid #dbeafe;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Hora</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['hora']}</strong>
                  </td></tr>
                  <tr><td style="padding:14px 20px;">
                    <span style="color:#64748b;font-size:13px;display:block;margin-bottom:2px;">Duración estimada</span>
                    <strong style="color:#1e293b;font-size:15px;">{datos['duracion']} minutos</strong>
                  </td></tr>
                </table>

                <p style="color:#64748b;font-size:14px;margin:28px 0 16px;">¿No puedes asistir? Puedes cancelar tu reserva haciendo clic en el botón:</p>

                <div style="text-align:center;margin:0 0 28px;">
                  <a href="{cancel_url}"
                     style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">
                    ❌ Cancelar mi reserva
                  </a>
                </div>

                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Si no hiciste esta reserva, ignora este correo.</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8faff;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f5;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 Barbería Krono · Todos los derechos reservados</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """


def enviar_confirmacion(destinatario: str, datos: dict):
    """Envía email de confirmación. Si no hay config SMTP, solo loguea."""
    if not SMTP_USER or not SMTP_PASS:
        print(f"[EMAIL] Sin config SMTP. Correo para {destinatario} NO enviado.")
        print(f"[EMAIL] Token cancelación: {datos.get('cancel_token')}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "✂ Confirmación de cita — Barbería Krono"
        msg["From"] = f"Barbería Krono <{SMTP_USER}>"
        msg["To"] = destinatario

        texto_plano = (
            f"Hola {datos['cliente_nombre']},\n\n"
            f"Tu cita ha sido confirmada.\n"
            f"Barbero: {datos['barbero']}\n"
            f"Servicio: {datos['servicio']}\n"
            f"Fecha: {datos['fecha']}\n"
            f"Hora: {datos['hora']}\n\n"
            f"Para cancelar tu reserva visita:\n"
            f"{FRONTEND_URL}/cancelar/{datos['cancel_token']}"
        )
        msg.attach(MIMEText(texto_plano, "plain"))
        msg.attach(MIMEText(_html_confirmacion(datos), "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, destinatario, msg.as_string())

        print(f"[EMAIL] Confirmación enviada a {destinatario}")
    except Exception as e:
        print(f"[EMAIL] Error al enviar a {destinatario}: {e}")
