import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ConfirmModal from '../components/ConfirmModal';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Checkout = () => {
    const { cartItems, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        direccion: '',
        notas: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'paypal'
    const [paypalClientId, setPaypalClientId] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                direccion: user.direccion || ''
            }));
        }
        // Obtener ID de Paypal
        const fetchPaypalId = async () => {
            try {
                const res = await api.get('/paypal/client-id');
                setPaypalClientId(res.data.client_id);
            } catch (e) {
                console.error("Error al obtener PayPal ID", e);
            }
        };
        fetchPaypalId();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const pedidoData = {
                direccion_envio: formData.direccion,
                notas: formData.notas,
                items: cartItems.map(item => ({
                    producto_id: item.id,
                    cantidad: item.quantity
                }))
            };

            const response = await api.post('/pedidos/', pedidoData);

            if (paymentMethod === 'stripe') {
                const stripeResponse = await api.post('/stripe/create-checkout-session', {
                    pedido_id: response.data.id
                });
                if (stripeResponse.data?.url) {
                    window.location.href = stripeResponse.data.url;
                }
            } else {
                // El flujo de PayPal se maneja en los componentes de PayPalButtons
                // Esta función solo se llama para Stripe ahora.
            }
        } catch (err) {
            console.error('checkout error', err);
            const msg = err.response?.data?.detail || err.message || 'Error al procesar el pedido.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePayPalCreateOrder = useCallback(async () => {
        if (!formData.direccion) {
            setError("Por favor, introduce una dirección de envío primero.");
            return "";
        }
        if (!cartItems || cartItems.length === 0) return "";

        setLoading(true);
        try {
            const pedidoData = {
                direccion_envio: formData.direccion,
                notas: formData.notas,
                items: cartItems.map(item => ({
                    producto_id: item.id,
                    cantidad: item.quantity
                }))
            };

            const response = await api.post('/pedidos/', pedidoData);
            setOrderInfo(response.data);

            const res = await api.post('/paypal/create-order', { pedido_id: response.data.id });
            return res.data.id;
        } catch (err) {
            console.error("Error en flujo de PayPal:", err);
            setError("Error al procesar el pago con PayPal.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [formData, cartItems, clearCart]);

    const handlePayPalApprove = useCallback(async (data) => {
        setLoading(true);
        try {
            await api.post(`/paypal/capture-order/${orderInfo.id}`, { order_id: data.orderID });
            clearCart();
            setShowSuccess(true);
        } catch (err) {
            console.error("Error capturando orden:", err);
            setError("Pago realizado en PayPal pero falló la confirmación en nuestro servidor.");
        } finally {
            setLoading(false);
        }
    }, [orderInfo, clearCart]);

    if (cartItems.length === 0 && !showSuccess) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛒</div>
                <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Tu carrito está vacío</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Añade algunos productos antes de tramitar el pedido.</p>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '15px 40px' }}>Volver al Catálogo</button>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* FORMULARIO Y RESUMEN */}
                <div className="glass-panel" style={{ padding: '40px', border: '1px solid var(--card-border)' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '30px' }}>Finalizar Compra 🚀</h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Dirección de Entrega *</label>
                            <textarea
                                name="direccion"
                                required
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Indica la calle, número, piso y CP..."
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)',
                                    border: '1px solid var(--card-border)', minHeight: '100px',
                                    outline: 'none', transition: 'border-color 0.3s ease'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Notas del Pedido (Opcional)</label>
                            <input
                                name="notas"
                                value={formData.notas}
                                onChange={handleChange}
                                placeholder="Instrucciones especiales para el repartidor..."
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)',
                                    border: '1px solid var(--card-border)', outline: 'none'
                                }}
                            />
                        </div>

                        {/* MÉTODO DE PAGO */}
                        <div style={{ marginBottom: '35px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase' }}>Método de Pago</label>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div
                                    onClick={() => setPaymentMethod('stripe')}
                                    style={{
                                        flex: 1, padding: '20px', borderRadius: '15px', border: `2px solid ${paymentMethod === 'stripe' ? 'var(--primary)' : 'var(--card-border)'}`,
                                        background: paymentMethod === 'stripe' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
                                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Tarjeta (Stripe)</div>
                                </div>
                                <div
                                    onClick={() => setPaymentMethod('paypal')}
                                    style={{
                                        flex: 1, padding: '20px', borderRadius: '15px', border: `2px solid ${paymentMethod === 'paypal' ? '#ffc439' : 'var(--card-border)'}`,
                                        background: paymentMethod === 'paypal' ? 'rgba(255, 196, 57, 0.1)' : 'rgba(255,255,255,0.02)',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🅿️</div>
                                    <div style={{ fontWeight: 800, fontSize: '14px' }}>PayPal</div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '15px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff3232', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255, 50, 50, 0.2)' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {paymentMethod === 'stripe' ? (
                            <form onSubmit={handleSubmit}>
                                <button type="submit" disabled={loading} style={{
                                    width: '100%', padding: '20px', borderRadius: '15px',
                                    background: 'var(--gradient-main)', color: 'white',
                                    fontWeight: 900, fontSize: '18px', border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 30px var(--primary-glow)',
                                    textTransform: 'uppercase'
                                }}>
                                    {loading ? 'Procesando...' : 'Pagar con Tarjeta'}
                                </button>
                            </form>
                        ) : (
                            paypalClientId ? (
                                <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "EUR", locale: "es_ES" }}>
                                    <PayPalButtons
                                        key={paypalClientId}
                                        style={{ layout: "vertical", shape: "pill", label: "pay" }}
                                        createOrder={handlePayPalCreateOrder}
                                        onApprove={handlePayPalApprove}
                                        onCancel={() => { setLoading(false); setError("Pago cancelado."); }}
                                        onError={(err) => {
                                            console.error("PayPal Error:", err);
                                            setLoading(false);
                                            setError("Error con PayPal. Verifica que tu Client ID sea correcto.");
                                        }}
                                    />
                                </PayPalScriptProvider>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando pasarela...</div>
                            )
                        )}
                    </form>
                </div>

                {/* RESUMEN DE COMPRA */}
                <div className="glass-panel" style={{ padding: '30px', height: 'fit-content', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Resumen del Pedido</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        background: item.imagen_url ? 'none' : 'var(--gradient-main)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        flexShrink: 0,
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {item.imagen_url ? (
                                            <img src={`${item.imagen_url}`} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            '📦'
                                        )}
                                    </div>
                                    <span>{item.quantity}x {item.nombre}</span>
                                </div>
                                <span style={{ fontWeight: 700 }}>{(item.precio * item.quantity).toFixed(2)}€</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                            <span>Subtotal:</span>
                            <span>{totalPrice.toFixed(2)}€</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--text-muted)' }}>
                            <span>Gastos de Envío:</span>
                            <span style={{ color: '#00ff64', fontWeight: 700 }}>GRATIS</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: 900 }}>
                            <span>Total:</span>
                            <span style={{ color: 'var(--primary)' }}>{totalPrice.toFixed(2)}€</span>
                        </div>
                    </div>
                </div>

            </div>

            <ConfirmModal
                isOpen={showSuccess}
                title="¡Pedido Confirmado! 🎉"
                message={`Tu pedido ${orderInfo?.numero_pedido} se ha registrado correctamente. Recibirás un correo cuando el paquete salga de nuestras oficinas.`}
                type="success"
                hideCancel={true}
                confirmText="Ir a Mis Pedidos"
                onConfirm={() => navigate('/mis-pedidos')}
            />
        </div>
    );
};

export default Checkout;
