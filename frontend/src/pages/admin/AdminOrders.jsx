import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

const STATUS_OPTIONS = [
    { value: 'pendiente', label: '⏳ Pendiente (Sin pagar)' },
    { value: 'confirmado', label: '✅ Confirmado (Pagado)' },
    { value: 'procesando', label: '⚙️ Procesando (En fabricación)' },
    { value: 'enviado', label: '🚚 Enviado' },
    { value: 'entregado', label: '📦 Entregado' },
    { value: 'cancelado', label: '❌ Cancelado' },
];

const getStatusColor = (status) => {
    if (status === 'pendiente') return '#ff9900';
    if (status === 'confirmado') return '#00ff64';
    if (status === 'procesando') return '#3a86ff';
    if (status === 'enviado') return '#a64dff';
    if (status === 'entregado') return '#00ff64';
    if (status === 'cancelado') return '#ff3232';
    return 'var(--text-muted)';
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pedidos/');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching all orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async () => {
        setError(null);
        try {
            await api.put(`/pedidos/${selectedOrder.id}`, { estado: newStatus });
            setShowUpdateModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar el estado.');
        }
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.estado);
        setError(null);
        setShowUpdateModal(true);
    };

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div style={{
                width: '40px', height: '40px',
                border: '4px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }}></div>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <header style={{ marginBottom: '50px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '10px' }}>Gestión de Pedidos 🛠️</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Control de ventas y logística para 3D4EVERYONE.</p>
            </header>

            <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: '0 6px', marginTop: '0' }}>
                    <thead>
                        <tr>
                            <th style={{ background: 'none', width: '36px' }}></th>
                            <th style={{ background: 'none' }}>Número</th>
                            <th style={{ background: 'none' }}>Cliente</th>
                            <th style={{ background: 'none' }}>Fecha</th>
                            <th style={{ background: 'none' }}>Estado</th>
                            <th style={{ background: 'none' }}>Total</th>
                            <th style={{ background: 'none' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <React.Fragment key={order.id}>
                                {/* FILA PRINCIPAL */}
                                <tr style={{ transition: 'all 0.2s ease' }}>
                                    <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleExpand(order.id)}>
                                        <span style={{
                                            display: 'inline-block',
                                            transition: 'transform 0.25s ease',
                                            transform: expandedId === order.id ? 'rotate(90deg)' : 'rotate(0)',
                                            fontSize: '16px', color: 'var(--text-muted)',
                                        }}>▶</span>
                                    </td>
                                    <td>
                                        <span
                                            onClick={() => toggleExpand(order.id)}
                                            style={{ fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.5px' }}
                                            title="Click para ver detalles"
                                        >
                                            {order.numero_pedido}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{order.cliente?.nombre} {order.cliente?.apellido}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.cliente?.email}</div>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>
                                        {new Date(order.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px',
                                            background: `${getStatusColor(order.estado)}20`,
                                            color: getStatusColor(order.estado),
                                            fontSize: '11px', fontWeight: 800,
                                            textTransform: 'uppercase',
                                            border: `1px solid ${getStatusColor(order.estado)}40`
                                        }}>
                                            {order.estado}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 900, fontSize: '16px' }}>{order.total.toFixed(2)}€</td>
                                    <td>
                                        <button
                                            onClick={() => openUpdateModal(order)}
                                            className="btn-action"
                                            style={{ background: 'var(--primary)', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
                                        >
                                            Cambiar Estado
                                        </button>
                                    </td>
                                </tr>

                                {/* FILA EXPANDIBLE */}
                                {expandedId === order.id && (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '0 8px 16px 8px' }}>
                                            <div style={{
                                                background: 'rgba(58, 134, 255, 0.04)',
                                                border: '1px solid rgba(58, 134, 255, 0.2)',
                                                borderRadius: '16px',
                                                padding: '24px',
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 280px',
                                                gap: '30px',
                                                animation: 'fadeIn 0.25s ease',
                                            }}>
                                                {/* ÍTEMS */}
                                                <div>
                                                    <h5 style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                                                        📋 Líneas del Pedido ({order.items?.length || 0} productos)
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
                                                                    <span style={{
                                                                        background: 'var(--gradient-main)', borderRadius: '8px',
                                                                        width: '28px', height: '28px', display: 'flex',
                                                                        alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                                                                    }}>📦</span>
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
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                                        x{item.cantidad} × {item.precio_unitario.toFixed(2)}€
                                                                    </div>
                                                                    <div style={{ fontSize: '15px', fontWeight: 800 }}>
                                                                        {item.subtotal.toFixed(2)}€
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* INFO LATERAL */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                                    <div>
                                                        <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                                            Dirección de Envío
                                                        </h5>
                                                        <p style={{ fontSize: '13px', lineHeight: '1.6' }}>{order.direccion_envio}</p>
                                                    </div>
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
                                                    <div style={{
                                                        marginTop: 'auto', paddingTop: '16px',
                                                        borderTop: '1px solid var(--card-border)',
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    }}>
                                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total</span>
                                                        <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)' }}>
                                                            {order.total.toFixed(2)}€
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                        No hay pedidos en el sistema todavía.
                    </div>
                )}
            </div>

            {/* MODAL ACTUALIZAR ESTADO */}
            <ConfirmModal
                isOpen={showUpdateModal}
                title="Actualizar Estado del Pedido"
                message={`Pedido ${selectedOrder?.numero_pedido} — ${selectedOrder?.cliente?.nombre} ${selectedOrder?.cliente?.apellido}`}
                onConfirm={handleUpdateStatus}
                onCancel={() => setShowUpdateModal(false)}
                confirmText="Guardar"
                type="warning"
            >
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Nuevo Estado
                    </label>
                    <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '10px',
                            background: '#1e293b', color: '#ffffff',
                            border: '1px solid var(--card-border)', outline: 'none',
                            fontSize: '14px', fontFamily: 'var(--font-family)',
                        }}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} style={{ background: '#1e293b', color: '#fff' }}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {error && (
                        <div style={{ color: '#ff3232', marginTop: '10px', fontSize: '13px' }}>⚠️ {error}</div>
                    )}
                </div>
            </ConfirmModal>
        </div>
    );
};

export default AdminOrders;
