import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

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

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                direccion: user.direccion || ''
            }));
        }
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
            setOrderInfo(response.data);
            setShowSuccess(true);
            clearCart();
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al procesar el pedido. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>

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

                        {error && (
                            <div style={{ padding: '15px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff3232', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255, 50, 50, 0.2)' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '20px', borderRadius: '15px',
                            background: 'var(--gradient-main)', color: 'white',
                            fontWeight: 900, fontSize: '18px', border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 10px 30px var(--primary-glow)',
                            textTransform: 'uppercase'
                        }}>
                            {loading ? 'Procesando Pedido...' : 'Confirmar y Pagar'}
                        </button>
                    </form>
                </div>

                {/* RESUMEN DE COMPRA */}
                <div className="glass-panel" style={{ padding: '30px', height: 'fit-content', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Resumen del Pedido</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span>{item.quantity}x {item.nombre}</span>
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
