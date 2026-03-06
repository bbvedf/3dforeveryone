from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List
import os
from jinja2 import Template

# Configuración SMTP
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("SMTP_USER", "test@example.com"),
    MAIL_PASSWORD=os.getenv("SMTP_PASSWORD", "test"),
    MAIL_FROM=os.getenv("SENDER_EMAIL", "noreply@3dforeveryone.com"),
    MAIL_PORT=int(os.getenv("SMTP_PORT", 1025)),
    MAIL_SERVER=os.getenv("SMTP_HOST", "mailhog"),
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=False,
    VALIDATE_CERTS=False,
)

fastmail = FastMail(conf)


# =============== TEMPLATES HTML ===============

WELCOME_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #e2e8f0; }
        .header { background-color: #0F172A; padding: 40px 20px; text-align: center; border-bottom: 3px solid #3a86ff; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #fff; }
        .header p { margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px; }
        .content { padding: 40px 30px; }
        .section-title { font-size: 12px; color: #3a86ff; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 15px; }
        .info-box { background-color: #0f172a; border-left: 4px solid #3a86ff; padding: 15px; margin: 20px 0; border-radius: 6px; }
        .info-box p { margin: 8px 0; font-size: 14px; }
        .info-box strong { color: #3a86ff; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #3a86ff 0%, #5b4cff 100%); color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #0f172a; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
        .footer-link { color: #3a86ff; text-decoration: none; }
        .divider { height: 1px; background-color: #334155; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="http://localhost:5173/logo_dark.png" alt="3D For Everyone" style="width: 300px; height: auto; margin: 0 auto 15px; display: block;">
            <h1>Bienvenido a tu tienda de impresión 3D</h1>            
        </div>
        
        <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong style="color: #3a86ff;">{{ user_name }}</strong>,</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Gracias por registrarte en <strong>3D For Everyone</strong>. Tu cuenta está lista para explorar nuestro catálogo de productos de impresión 3D de alta calidad.
            </p>
            
            <div class="info-box">
                <div class="section-title">📋 Información de tu Cuenta</div>
                <p><strong>Email:</strong> {{ email }}</p>
                <p><strong>Nombre:</strong> {{ user_name }}</p>
                <p><strong>Fecha de Registro:</strong> {{ created_at }}</p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-top: 25px;">
                ✨ <strong>¿Qué puedes hacer ahora?</strong>
            </p>
            <ul style="font-size: 14px; color: #cbd5e1; line-height: 1.8;">
                <li>Explorar nuestro catálogo de productos 3D</li>
                <li>Agregar productos a tu carrito</li>
                <li>Realizar compras de forma segura</li>
                <li>Seguir el estado de tus pedidos</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/" class="cta-button">Ir al Catálogo</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #64748b;">
                Si tienes problemas para acceder a tu cuenta o necesitas ayuda, contáctanos en <strong style="color: #3a86ff;">support@3dforeveryone.com</strong>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2024-2025 <strong>3D For Everyone</strong>. Todos los derechos reservados.</p>
            <p style="margin: 0;">Impresión 3D de Calidad | Envío Rápido | Servicio Profesional</p>
        </div>
    </div>
</body>
</html>
"""

ORDER_CONFIRMATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #e2e8f0; }
        .header { background-color: #0F172A; padding: 40px 20px; text-align: center; border-bottom: 3px solid #3a86ff; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #fff; }
        .header p { margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 40px 30px; }
        .section-title { font-size: 12px; color: #3a86ff; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #0f172a; color: #3a86ff; padding: 12px; text-align: left; border-bottom: 2px solid #3a86ff; font-weight: 600; font-size: 12px; }
        td { padding: 12px; border-bottom: 1px solid #334155; }
        tr:last-child td { border-bottom: 2px solid #3a86ff; }
        .total-row { font-weight: 700; color: #fff; }
        .total-row td { font-size: 16px; padding-top: 16px; }
        .info-box { background-color: #0f172a; border-left: 4px solid #3a86ff; padding: 15px; margin: 20px 0; border-radius: 6px; }
        .info-box p { margin: 8px 0; font-size: 14px; }
        .badge { display: inline-block; background-color: #1e40af; color: #3a86ff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-success { background-color: #1e3a8a; border-left: 4px solid #3a86ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .status-success p { margin: 0; font-size: 14px; color: #fff; }
        .footer { background-color: #0f172a; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="http://localhost:5173/logo_dark.png" alt="3D For Everyone" style="width: 300px; height: auto; margin: 0 auto 15px; display: block;">
            <h1>✅ Pedido Confirmado</h1>            
        </div>
        
        <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong style="color: #3a86ff;">{{ user_name }}</strong>,</p>
            
            <div class="status-success">
                <p>✨ Tu pago ha sido procesado exitosamente. Tu pedido está siendo preparado.</p>
            </div>
            
            <div class="section-title">📦 Resumen del Pedido</div>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {% for item in items %}
                    <tr>
                        <td>{{ item.product_name }}</td>
                        <td style="text-align: center;">{{ item.quantity }}</td>
                        <td>${{ "%.2f"|format(item.unit_price) }}</td>
                        <td style="text-align: right; font-weight: 600;">${{ "%.2f"|format(item.total) }}</td>
                    </tr>
                    {% endfor %}
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right;">Total:</td>
                        <td style="text-align: right; color: #3a86ff;">${{ "%.2f"|format(total_amount) }}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="info-box">
                <div class="section-title">📍 Dirección de Envío</div>
                <p style="margin: 10px 0; line-height: 1.6;">{{ shipping_address }}</p>
            </div>
            
            <div class="info-box">
                <div class="section-title">📋 Información del Pedido</div>
                <p><strong>Número de Pedido:</strong> #{{ order_id }}</p>
                <p><strong>Fecha:</strong> {{ order_date }}</p>
                <p><strong>Estado:</strong> <span class="badge">{{ status|upper }}</span></p>
            </div>
            
            <p style="font-size: 14px; color: #cbd5e1; margin-top: 25px;">
                📧 Te enviaremos un correo cuando tu pedido sea enviado con el número de seguimiento.
            </p>
            
            <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                Si tienes dudas sobre tu pedido, puedes contactarnos en <strong style="color: #3a86ff;">support@3dforeveryone.com</strong>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2024-2025 <strong>3D For Everyone</strong>. Todos los derechos reservados.</p>
            <p style="margin: 0;">Impresión 3D de Calidad | Envío Rápido | Servicio Profesional</p>
        </div>
    </div>
</body>
</html>
"""

SHIPMENT_NOTIFICATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #e2e8f0; }
        .header { background-color: #0F172A; padding: 40px 20px; text-align: center; border-bottom: 3px solid #3a86ff; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #fff; }
        .header p { margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px; }
        .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
        .content { padding: 40px 30px; }
        .section-title { font-size: 12px; color: #3a86ff; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 15px; }
        .status-box { background: linear-gradient(135deg, rgba(58, 134, 255, 0.2) 0%, rgba(58, 134, 255, 0.1) 100%); border-left: 4px solid #3a86ff; padding: 20px; margin: 20px 0; border-radius: 6px; }
        .status-box p { margin: 10px 0; font-size: 14px; }
        .tracking-box { background-color: #0f172a; border: 2px solid #3a86ff; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 18px; font-weight: 700; color: #3a86ff; font-family: monospace; letter-spacing: 1px; margin: 10px 0; }
        .info-box { background-color: #0f172a; border-left: 4px solid #3a86ff; padding: 15px; margin: 20px 0; border-radius: 6px; }
        .info-box p { margin: 8px 0; font-size: 14px; }
        .timeline { margin: 20px 0; }
        .timeline-item { display: flex; margin-bottom: 15px; }
        .timeline-icon { width: 30px; height: 30px; background-color: #3a86ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; flex-shrink: 0; }
        .timeline-content { margin-left: 15px; }
        .timeline-content p { margin: 5px 0; font-size: 13px; }
        .footer { background-color: #0f172a; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="http://localhost:5173/logo_dark.png" alt="3D For Everyone" style="width: 300px; height: auto; margin: 0 auto 15px; display: block;">
            <h1>🚚 Tu Pedido ha sido Enviado</h1>            
        </div>
        
        <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong style="color: #3a86ff;">{{ user_name }}</strong>,</p>
            
            <div class="status-box">
                <div style="font-size: 24px; color: #3a86ff;">🎉</div>
                <p style="font-size: 16px; font-weight: 600; margin-top: 10px; color: #fff;">Tu pedido #{{ order_id }} está en camino</p>
                <p style="font-size: 14px; margin-bottom: 0;">Despachado el {{ shipment_date }}</p>
            </div>
            
            {% if tracking_number %}
            <div class="tracking-box">
                <div style="font-size: 12px; color: #3a86ff; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Número de Seguimiento</div>
                <div class="tracking-number">{{ tracking_number }}</div>
                <p style="font-size: 12px; color: #64748b; margin: 10px 0 0 0;">Usa este número para rastrear tu pedido</p>
            </div>
            {% endif %}
            
            <div class="info-box">
                <div class="section-title">📍 Dirección de Entrega</div>
                <p style="margin: 10px 0; line-height: 1.6;">{{ shipping_address }}</p>
            </div>
            
            <div class="section-title" style="margin-top: 30px;">📦 Resumen del Pedido</div>
            <div class="info-box">
                <p><strong>Número de Pedido:</strong> #{{ order_id }}</p>
                <p><strong>Monto Total:</strong> <span style="color: #3a86ff; font-weight: 700;">${{ "%.2f"|format(total_amount) }}</span></p>
                <p><strong>Estado:</strong> <span style="color: #3a86ff; font-weight: 700;">ENVIADO</span></p>
            </div>
            
            <div class="section-title" style="margin-top: 30px;">📍 Estados de tu Pedido</div>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-icon">✓</div>
                    <div class="timeline-content">
                        <p style="font-weight: 600; color: #fff;">Pedido Confirmado</p>                        
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon">✓</div>
                    <div class="timeline-content">
                        <p style="font-weight: 600; color: #fff;">En Tránsito</p>
                        <p style="color: #3a86ff;">{{ shipment_date }}</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon">→</div>
                    <div class="timeline-content">
                        <p style="font-weight: 600; color: #fff;">Entrega Esperada</p>
                        <p style="color: #64748b;">Próximos 3-5 días hábiles</p>
                    </div>
                </div>
            </div>
            
            <p style="font-size: 13px; color: #64748b; margin-top: 25px;">
                ℹ️ Si necesitas ayuda con tu pedido, contáctanos en <strong style="color: #3a86ff;">support@3dforeveryone.com</strong>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2024-2025 <strong>3D For Everyone</strong>. Todos los derechos reservados.</p>
            <p style="margin: 0;">Impresión 3D de Calidad | Envío Rápido | Servicio Profesional</p>
        </div>
    </div>
</body>
</html>
"""


# =============== FUNCIONES DE ENVÍO ===============

async def send_welcome_email(email: EmailStr, user_name: str, created_at: str):
    """Envía correo de bienvenida al registrarse"""
    template = Template(WELCOME_EMAIL_TEMPLATE)
    html = template.render(
        user_name=user_name,
        email=email,
        created_at=created_at,
    )
    
    message = MessageSchema(
        subject="¡Bienvenido a 3D For Everyone!",
        recipients=[email],
        body=html,
        subtype="html",
    )
    
    await fastmail.send_message(message)


async def send_order_confirmation_email(
    email: EmailStr,
    user_name: str,
    order_id: int,
    items: list,
    total_amount: float,
    shipping_address: str,
    order_date: str,
    status: str = "PENDING",
):
    """Envía recibo de pedido"""
    template = Template(ORDER_CONFIRMATION_TEMPLATE)
    html = template.render(
        user_name=user_name,
        order_id=order_id,
        items=items,
        total_amount=total_amount,
        shipping_address=shipping_address,
        order_date=order_date,
        status=status,
    )
    
    message = MessageSchema(
        subject=f"Confirmación de Pedido #{order_id}",
        recipients=[email],
        body=html,
        subtype="html",
    )
    
    await fastmail.send_message(message)


async def send_shipment_notification_email(
    email: EmailStr,
    user_name: str,
    order_id: int,
    shipping_address: str,
    total_amount: float,
    shipment_date: str,
    tracking_number: str = None,
):
    """Envía notificación de envío"""
    template = Template(SHIPMENT_NOTIFICATION_TEMPLATE)
    html = template.render(
        user_name=user_name,
        order_id=order_id,
        shipping_address=shipping_address,
        total_amount=total_amount,
        shipment_date=shipment_date,
        tracking_number=tracking_number,
    )
    
    message = MessageSchema(
        subject=f"¡Tu pedido #{order_id} ha sido enviado!",
        recipients=[email],
        body=html,
        subtype="html",
    )
    
    await fastmail.send_message(message)
