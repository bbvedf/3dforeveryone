import httpx
import base64
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Pedido, EstadoPedido
from app.config import settings
from app.security import get_current_user
from app.email_service import send_order_confirmation_email

router = APIRouter(prefix="/paypal", tags=["paypal"])

# Base URL para PayPal
PAYPAL_API = "https://api-m.sandbox.paypal.com" if settings.paypal_mode == "sandbox" else "https://api-m.paypal.com"

@router.get("/client-id")
def get_paypal_client_id():
    """Devuelve el Client ID de PayPal (público) para el frontend."""
    return {"client_id": settings.paypal_client_id}

async def get_paypal_access_token():
    """Obtiene el access token de PayPal usando Client ID y Secret."""
    if not settings.paypal_client_id or not settings.paypal_client_secret:
        raise HTTPException(status_code=500, detail="PayPal credentials not configured")
    
    auth_str = f"{settings.paypal_client_id}:{settings.paypal_client_secret}"
    auth_base64 = base64.b64encode(auth_str.encode()).decode()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {auth_base64}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get PayPal access token")
        
        return response.json()["access_token"]

class PayPalOrderRequest(BaseModel):
    pedido_id: int

@router.post("/create-order")
async def create_paypal_order(
    req: PayPalOrderRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Crea una orden en PayPal para un pedido existente."""
    pedido = db.query(Pedido).filter(Pedido.id == req.pedido_id, Pedido.cliente_id == current_user.id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    if pedido.estado != EstadoPedido.PENDIENTE:
        raise HTTPException(status_code=400, detail="Solo se pueden pagar pedidos pendientes")

    access_token = await get_paypal_access_token()
    
    # Construir el cuerpo de la orden para PayPal de forma simplificada
    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "EUR",
                "value": "{:.2f}".format(pedido.total)
            }
        }],
        "application_context": {
            "brand_name": "3D4EVERYONE",
            "shipping_preference": "NO_SHIPPING", # Evita validaciones de dirección que causan errores
            "user_action": "PAY_NOW",
            "return_url": f"http://localhost:5173/mis-pedidos?success=true&pedido_id={pedido.id}",
            "cancel_url": f"http://localhost:5173/checkout?canceled=true"
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=order_data
        )
        
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=500, detail=f"PayPal Order creation failed: {response.text}")
        
        return response.json()

class CaptureRequest(BaseModel):
    order_id: str # Este es el ID de PayPal

@router.post("/capture-order/{pedido_id}")
async def capture_paypal_order(
    pedido_id: int,
    req: CaptureRequest,
    db: Session = Depends(get_db),
):
    """Captura el pago de una orden de PayPal ya autorizada por el usuario."""
    access_token = await get_paypal_access_token()
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_API}/v2/checkout/orders/{req.order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }
        )
        
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=500, detail=f"PayPal capture failed: {response.text}")
        
        data = response.json()
        
        if data.get("status") == "COMPLETED":
            # Actualizar el pedido en la base de datos
            pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
            if pedido and pedido.estado == EstadoPedido.PENDIENTE:
                pedido.estado = EstadoPedido.CONFIRMADO
                pedido.actualizado_en = datetime.utcnow()
                db.commit()
                db.refresh(pedido)
                
                # Enviar email de confirmación
                try:
                    items = [
                        {
                            "product_name": item.producto.nombre,
                            "quantity": item.cantidad,
                            "unit_price": item.precio_unitario,
                            "total": item.precio_unitario * item.cantidad,
                        }
                        for item in pedido.items
                    ]
                    
                    await send_order_confirmation_email(
                        email=pedido.cliente.email,
                        user_name=pedido.cliente.nombre,
                        order_id=pedido.id,
                        items=items,
                        total_amount=pedido.total,
                        shipping_address=pedido.direccion_envio,
                        order_date=pedido.creado_en.strftime("%d/%m/%Y"),
                        status=pedido.estado.value,
                    )
                except Exception as e:
                    print(f"[email] Error enviando confirmación para pedido {pedido_id}: {str(e)}")
                
                return {"status": "success", "message": "Pago completado correctamente"}
            else:
                return {"status": "error", "message": "Pedido no encontrado o ya procesado"}
        
        return data
