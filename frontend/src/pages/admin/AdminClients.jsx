import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

const AdminClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clientes/');
            setClients(response.data);
        } catch (err) {
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeactivate = async () => {
        try {
            await api.delete(`/clientes/${selectedClient.id}`);
            setShowDeactivateModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Error al desactivar el cliente.');
        }
    };

    const handleDeletePermanent = async () => {
        try {
            await api.delete(`/clientes/${selectedClient.id}/eliminar`);
            setShowDeleteModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Error al eliminar el cliente.');
        }
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
                <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '10px' }}>Directorio de Clientes 👥</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
                    Gestión y supervisión de usuarios registrados en 3D4EVERYONE.
                </p>
            </header>

            <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', marginTop: '0' }}>
                    <thead>
                        <tr>
                            <th style={{ background: 'none' }}>ID</th>
                            <th style={{ background: 'none' }}>Nombre</th>
                            <th style={{ background: 'none' }}>Contacto</th>
                            <th style={{ background: 'none' }}>Ubicación</th>
                            <th style={{ background: 'none' }}>Rol</th>
                            <th style={{ background: 'none' }}>Estado</th>
                            <th style={{ background: 'none' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} style={{
                                opacity: client.activo ? 1 : 0.5,
                                transition: 'all 0.3s ease',
                            }}>
                                <td style={{ color: 'var(--primary)', fontWeight: 800 }}>#{client.id}</td>
                                <td>
                                    <div style={{ fontWeight: 700 }}>{client.nombre} {client.apellido}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.email}</div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px' }}>{client.email}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.telefono || 'Sin teléfono'}</div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px' }}>{[client.ciudad, client.pais].filter(Boolean).join(', ') || '—'}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.codigo_postal || ''}</div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '8px',
                                        background: client.rol === 'admin' ? 'rgba(255,0,110,0.1)' : 'rgba(58,134,255,0.1)',
                                        color: client.rol === 'admin' ? 'var(--accent)' : 'var(--primary)',
                                        fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                                    }}>
                                        {client.rol}
                                    </span>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '8px',
                                        background: client.activo ? 'rgba(0,255,100,0.1)' : 'rgba(255,50,50,0.1)',
                                        color: client.activo ? '#00ff64' : '#ff3232',
                                        fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                                    }}>
                                        {client.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {client.activo ? (
                                            <button
                                                onClick={() => { setSelectedClient(client); setShowDeactivateModal(true); }}
                                                className="btn-action"
                                                disabled={client.rol === 'admin'}
                                                title={client.rol === 'admin' ? 'No se puede desactivar un admin' : 'Desactivar acceso'}
                                                style={{
                                                    opacity: client.rol === 'admin' ? 0.3 : 1,
                                                    cursor: client.rol === 'admin' ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { setSelectedClient(client); setShowDeleteModal(true); }}
                                                className="btn-action btn-delete"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL: Desactivar (soft delete) */}
            <ConfirmModal
                isOpen={showDeactivateModal}
                title="Desactivar Cliente"
                message={`¿Desactivar a ${selectedClient?.nombre} ${selectedClient?.apellido}? No podrá iniciar sesión, pero sus datos y pedidos se conservarán.`}
                onConfirm={handleDeactivate}
                onCancel={() => setShowDeactivateModal(false)}
                type="warning"
                confirmText="Sí, Desactivar"
            />

            {/* MODAL: Eliminar definitivo (hard delete) */}
            <ConfirmModal
                isOpen={showDeleteModal}
                title="⚠️ Eliminar Cliente Permanentemente"
                message={`¿Eliminar DEFINITIVAMENTE a ${selectedClient?.nombre} ${selectedClient?.apellido}? Esta acción borrará su cuenta de la base de datos. Sus pedidos quedarán huérfanos.`}
                onConfirm={handleDeletePermanent}
                onCancel={() => setShowDeleteModal(false)}
                type="error"
                confirmText="Eliminar para siempre"
            />
        </div>
    );
};

export default AdminClients;
