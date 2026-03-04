import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        totalPrice,
        totalItems
    } = useCart();

    const navigate = useNavigate();

    if (!isCartOpen) return null;

    return (
        <>
            {/* OVERLAY */}
            <div
                onClick={() => setIsCartOpen(false)}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 2500,
                    animation: 'fade-in 0.3s ease'
                }}
            ></div>

            {/* DRAWER PANEL */}
            <div style={{
                position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '450px',
                height: '100vh', background: 'var(--background)', zIndex: 3000,
                boxShadow: '-20px 0 50px rgba(0,0,0,0.5)', borderLeft: '1px solid var(--card-border)',
                display: 'flex', flexDirection: 'column',
                animation: 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* HEADER */}
                <div style={{ padding: '30px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Tu Carrito 🛒</h2>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{totalItems} piezas seleccionadas</span>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-main)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', fontWeight: 800 }}
                    >
                        ✕
                    </button>
                </div>

                {/* ITEMS LIST */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {cartItems.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>Empty</div>
                            <p>Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '15px', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                        📦
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{item.nombre}</h4>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '18px' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>{item.material}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px 8px', border: '1px solid var(--card-border)' }}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 900 }}>-</button>
                                                <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 900 }}>+</button>
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '16px' }}>{(item.precio * item.quantity).toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div style={{ padding: '30px', borderTop: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'baseline' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Total Estimado:</span>
                        <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)' }}>{totalPrice.toFixed(2)}€</span>
                    </div>

                    <button
                        disabled={cartItems.length === 0}
                        onClick={() => {
                            setIsCartOpen(false);
                            navigate('/checkout');
                        }}
                        style={{
                            width: '100%', padding: '20px', borderRadius: '15px',
                            background: 'var(--gradient-main)', color: 'white',
                            fontWeight: 900, fontSize: '18px', border: 'none',
                            cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: cartItems.length === 0 ? 0.5 : 1,
                            boxShadow: '0 10px 30px var(--primary-glow)',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}
                    >
                        Tramitar Pedido
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Envío certificado a toda España (Península y Baleares)
                    </p>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
