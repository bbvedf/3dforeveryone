import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';

const AdminClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Filtros, Paginación y Ordenación
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState('nombre');
    const [orderDir, setOrderDir] = useState('asc');
    const limit = 10;

    const fetchData = async () => {
        try {
            setLoading(true);
            const offset = page * limit;
            let url = `/clientes/?limit=${limit}&skip=${offset}&search=${search}&order_by=${orderBy}&order_dir=${orderDir}`;
            if (filterStatus !== '') url += `&activo=${filterStatus}`;

            const response = await api.get(url);
            setClients(response.data);
        } catch (err) {
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, search, filterStatus, orderBy, orderDir]);

    const handleSort = (column) => {
        if (orderBy === column) {
            setOrderDir(orderDir === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(column);
            setOrderDir('asc');
        }
        setPage(0);
    };

    const SortIndicator = ({ column }) => {
        if (orderBy !== column) return <span style={{ opacity: 0.3, marginLeft: '5px' }}>↕</span>;
        return <span style={{ marginLeft: '5px', color: 'var(--primary)' }}>{orderDir === 'asc' ? '↑' : '↓'}</span>;
    };

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

    // Eliminado early return de loading para evitar pérdida de foco

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <header style={{ marginBottom: '50px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '10px' }}>Directorio de Clientes 👥</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
                    Gestión y supervisión de usuarios registrados en 3D4EVERYONE.
                </p>
            </header>

            {/* BARRA DE FILTROS */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', border: '1px solid var(--card-border)' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Búsqueda</label>
                    <input
                        type="text"
                        placeholder="Nombre, email o apellido..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                    />
                </div>

                <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                    >
                        <option value="">Cualquiera</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>

                <button
                    onClick={() => { setSearch(''); setFilterStatus(''); setPage(0); setOrderBy('nombre'); setOrderDir('asc'); }}
                    style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '13px' }}
                >
                    Limpiar
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--card-border)', overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', marginTop: '0' }}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', userSelect: 'none', background: 'none' }}>
                                ID <SortIndicator column="id" />
                            </th>
                            <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer', userSelect: 'none', background: 'none' }}>
                                Nombre <SortIndicator column="nombre" />
                            </th>
                            <th onClick={() => handleSort('email')} style={{ cursor: 'pointer', userSelect: 'none', background: 'none' }}>
                                Contacto <SortIndicator column="email" />
                            </th>
                            <th style={{ background: 'none' }}>Ubicación</th>
                            <th onClick={() => handleSort('rol')} style={{ cursor: 'pointer', userSelect: 'none', background: 'none' }}>
                                Rol <SortIndicator column="rol" />
                            </th>
                            <th onClick={() => handleSort('activo')} style={{ cursor: 'pointer', userSelect: 'none', background: 'none' }}>
                                Estado <SortIndicator column="activo" />
                            </th>
                            <th style={{ background: 'none' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Cargando clientes...</td>
                            </tr>
                        ) : clients.map(client => (
                            <tr key={client.id} style={{
                                opacity: client.activo ? 1 : 0.5,
                                transition: 'all 0.3s ease',
                            }}>
                                <td style={{ color: 'var(--primary)', fontWeight: 800 }}>#{client.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            background: 'var(--gradient-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 800,
                                            color: 'white',
                                            flexShrink: 0
                                        }}>
                                            {client.avatar_url ? (
                                                <img src={`${client.avatar_url}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                (client.nombre?.[0] || 'U').toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{client.nombre} {client.apellido}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{client.email}</div>
                                        </div>
                                    </div>
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

                {(!loading && clients.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No se encontraron clientes con estos filtros.
                    </div>
                )}

                {/* PAGINACIÓN */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', background: 'var(--navbar-bg)',
                            color: page === 0 ? 'var(--text-muted)' : 'var(--text-main)', border: '1px solid var(--card-border)',
                            cursor: page === 0 ? 'default' : 'pointer'
                        }}
                    >
                        Anterior
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, padding: '0 15px' }}>Pág. {page + 1}</span>
                    <button
                        disabled={clients.length < limit}
                        onClick={() => setPage(page + 1)}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', background: 'var(--navbar-bg)',
                            color: clients.length < limit ? 'var(--text-muted)' : 'var(--text-main)', border: '1px solid var(--card-border)',
                            cursor: clients.length < limit ? 'default' : 'pointer'
                        }}
                    >
                        Siguiente
                    </button>
                </div>
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
