import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await api.get('/pedidos/');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'pendiente') return '#ff9900';
        if (status === 'confirmado') return '#00ff64';
        if (status === 'procesando') return '#3a86ff';
        if (status === 'enviado') return '#a64dff';
        if (status === 'entregado') return '#00ff64';
        if (status === 'cancelado') return '#ff3232';
        return 'var(--text-muted)';
    };

    const getStatusLabel = (status) => {
        const map = {
            pendiente: '⏳ Pendiente',
            confirmado: '✅ Confirmado',
            procesando: '⚙️ En fabricación',
            enviado: '🚚 Enviado',
            entregado: '📦 Entregado',
            cancelado: '❌ Cancelado',
        };
        return map[status] || status;
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="animate-spin" style={{
                width: '40px', height: '40px',
                border: '4px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%'
            }}></div>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <header style={{ marginBottom: '50px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '10px' }}>
                    {isAdmin ? 'Gestión de Pedidos 🛠️' : 'Mis Pedidos 📦'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
                    {isAdmin
                        ? 'Panel de control administrativo de todas las compras realizadas.'
                        : 'Historial y seguimiento de tus piezas de impresión 3D.'}
                </p>
            </header>

            {orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>📁</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Aún no hay pedidos registrados.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {orders.map(order => (
                        <div key={order.id} className="glass-panel" style={{
                            border: '1px solid var(--card-border)',
                            transition: 'border-color 0.3s ease',
                            overflow: 'hidden',
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
                        >
                            {/* CABECERA DEL PEDIDO */}
                            <div style={{
                                padding: '24px 30px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                flexWrap: 'wrap', gap: '15px',
                            }}>
                                <div>
                                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                        {order.numero_pedido}
                                    </h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {new Date(order.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                    {isAdmin && order.cliente && (
                                        <p style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '3px', fontWeight: 600 }}>
                                            👤 {order.cliente.nombre} {order.cliente.apellido} — {order.cliente.email}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '6px 18px', borderRadius: '30px',
                                        background: `${getStatusColor(order.estado)}15`,
                                        color: getStatusColor(order.estado),
                                        fontWeight: 900, fontSize: '12px',
                                        textTransform: 'uppercase', letterSpacing: '1px',
                                        border: `1px solid ${getStatusColor(order.estado)}30`,
                                    }}>
                                        {getStatusLabel(order.estado)}
                                    </span>
                                    <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>
                                        {order.total.toFixed(2)}€
                                    </span>
                                </div>
                            </div>

                            {/* CUERPO DEL PEDIDO */}
                            <div style={{
                                borderTop: '1px solid var(--card-border)',
                                padding: '20px 30px',
                                display: 'grid',
                                gridTemplateColumns: order.direccion_envio ? '1fr 1fr' : '1fr',
                                gap: '30px',
                            }}>
                                {/* LÍNEAS DE PEDIDO */}
                                <div>
                                    <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                        Productos ({order.items?.length || 0})
                                    </h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {order.items?.map(item => (
                                            <div key={item.id} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '10px 14px', borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        background: item.producto?.imagen_url ? 'none' : 'var(--gradient-main)',
                                                        borderRadius: '8px',
                                                        width: '28px',
                                                        height: '28px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        flexShrink: 0,
                                                        overflow: 'hidden',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        {item.producto?.imagen_url ? (
                                                            <img src={`${item.producto.imagen_url}`} alt={item.producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            '📦'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>
                                                            {item.producto?.nombre || `Producto #${item.producto_id}`}
                                                        </div>
                                                        {item.producto?.material && (
                                                            <div style={{ fontSize: '11px', color: 'var(--primary)' }}>
                                                                {item.producto.material}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        x{item.cantidad} × {(item.precio_unitario).toFixed(2)}€
                                                    </div>
                                                    <div style={{ fontSize: '15px', fontWeight: 800 }}>
                                                        {item.subtotal.toFixed(2)}€
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DIRECCIÓN + NOTAS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {order.direccion_envio && (
                                        <div>
                                            <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                                Dirección de Envío
                                            </h5>
                                            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                                                {order.direccion_envio}
                                            </p>
                                        </div>
                                    )}
                                    {order.notas && (
                                        <div>
                                            <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                                Notas
                                            </h5>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                "{order.notas}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
