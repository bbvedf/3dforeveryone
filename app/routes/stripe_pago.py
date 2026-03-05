import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Pedido, ItemPedido, Producto, Cliente, EstadoPedido
from app.schemas import PedidoResponse
from app.config import settings
from app.security import get_current_user
from datetime import datetime

router = APIRouter(prefix="/stripe", tags=["stripe"])

# show truncated key on startup (for debugging only)
if settings.stripe_secret_key:
    print(f"[stripe] secret key set (len={len(settings.stripe_secret_key)})")
else:
    print("[stripe] WARNING: secret key is empty")

stripe.api_key = settings.stripe_secret_key


class CheckoutRequest(BaseModel):
    pedido_id: int


@router.post("/create-checkout-session")
def create_checkout_session(
    req: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Crea una sesión de Checkout de Stripe para un pedido existente.
    El cliente envía un JSON con `pedido_id`.
    """

    pedido_id = req.pedido_id

    pedido = db.query(Pedido).filter(Pedido.id == pedido_id, Pedido.cliente_id == current_user.id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    if pedido.estado != EstadoPedido.PENDIENTE:
        raise HTTPException(status_code=400, detail="Solo se pueden pagar pedidos en estado pendiente")

    # Construir los items para Stripe
    line_items = []
    for item in pedido.items:
        line_items.append({
            'price_data': {
                'currency': 'eur',
                'product_data': {
                    'name': item.producto.nombre,
                    'description': f"Material: {item.producto.material}",
                },
                'unit_amount': int(item.precio_unitario * 100), # Stripe usa céntimos
            },
            'quantity': item.cantidad,
        })

    try:
        # Aquí definimos las URLs de retorno (donde vuelve el usuario tras pagar o cancelar)
        # En local suelen ser http://localhost:5173/...
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=f"http://localhost:5173/mis-pedidos?success=true&pedido_id={pedido.id}",
            cancel_url=f"http://localhost:5173/checkout?canceled=true",
            client_reference_id=str(pedido.id),
            customer_email=current_user.email,
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook de Stripe para procesar eventos de pago.
    Stripe nos notifica cuando un pago se completa, rechaza, etc.
    Usamos el webhook_secret para validar que la petición viene realmente de Stripe.
    
    Importante: Este endpoint NO requiere autenticación JWT (lo llama Stripe, no el usuario).
    """
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    event = None

    try:
        # Validar la firma del webhook usando el secret que Stripe nos proporcionó
        # En desarrollo, si el secret está vacío, permitimos webhooks sin validar firma
        # (útil para Stripe CLI o pruebas locales)
        if settings.stripe_webhook_secret:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.stripe_webhook_secret
            )
        else:
            # En desarrollo sin secret, aceptamos el payload como JSON crudo
            import json
            event = json.loads(payload)
            print("[stripe] WARNING: Webhook sin validación de firma (secret vacío)")
    except ValueError as e:
        # Payload inválido
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Firma inválida (no vino realmente de Stripe)
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Procesar el evento
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        # payment_intent.client_metadata['order_id'] contiene el ID del pedido
        # O podemos sacarlo desde Checkout.Session
        print(f"[stripe] payment_intent.succeeded: {payment_intent['id']}")
        
        # Buscamos la sesión de checkout asociada para obtener el client_reference_id
        sessions = stripe.checkout.Session.list(
            payment_intent=payment_intent["id"],
            limit=1
        )
        
        if sessions and sessions.data:
            session = sessions.data[0]
            pedido_id = int(session.client_reference_id)
            
            # Obtener el pedido y actualizarlo
            pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
            if pedido:
                pedido.estado = EstadoPedido.CONFIRMADO
                pedido.actualizado_en = datetime.utcnow()
                db.commit()
                print(f"[stripe] Pedido {pedido_id} marcado como CONFIRMADO")
            else:
                print(f"[stripe] WARNING: Pedido {pedido_id} no encontrado en base de datos")
    
    elif event["type"] == "charge.failed":
        charge = event["data"]["object"]
        print(f"[stripe] charge.failed: {charge['id']}")
        # Podríamos marcar el pedido como "pago rechazado", pero por ahora solo lo logueamos
    
    # Siempre devolver 200 OK a Stripe (aunque no hayamos podido procesar el evento completo)
    # Si no devolvemos 200, Stripe reintentar el webhook múltiples veces
    return {"status": "received"}


@router.post("/webhook-test/{pedido_id}")
async def stripe_webhook_test(pedido_id: int, db: Session = Depends(get_db)):
    """
    Endpoint de PRUEBA para simular un webhook de Stripe en desarrollo.
    Útil para probar el flujo de pago sin necesidad de Stripe CLI.
    
    En producción, ELIMINAR este endpoint y usar Stripe CLI o una URL pública.
    
    Uso: POST /stripe/webhook-test/10
    """
    print(f"[stripe] WEBHOOK TEST para pedido {pedido_id}")
    
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail=f"Pedido {pedido_id} no encontrado")
    
    # Simular el cambio de estado
    pedido.estado = EstadoPedido.CONFIRMADO
    pedido.actualizado_en = datetime.utcnow()
    db.commit()
    db.refresh(pedido)
    
    return {
        "status": "success",
        "pedido_id": pedido_id,
        "nuevo_estado": pedido.estado,
        "mensaje": "Pedido marcado como confirmado (webhook test)"
    }

