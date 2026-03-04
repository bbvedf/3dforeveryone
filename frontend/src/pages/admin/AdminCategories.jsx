import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import CategoryModal from './CategoryModal';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: '', id: null });
    const [editingCategory, setEditingCategory] = useState(null);

    // Filtros, Ordenación y Paginación
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState('nombre');
    const [orderDir, setOrderDir] = useState('asc');
    const limit = 10;

    // Utilidad para ignorar tildes/acentos
    const removeAccents = (str) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Estado para errores (usaremos ConfirmModal como Alerta)
    const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categorias/admin');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openConfirm = (type, id) => {
        setConfirmAction({ type, id });
        setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
        try {
            if (confirmAction.type === 'soft') {
                await api.delete(`/categorias/${confirmAction.id}`);
            } else {
                await api.delete(`/categorias/${confirmAction.id}/eliminar`);
            }
            setIsConfirmOpen(false);
            fetchCategories();
        } catch (err) {
            setIsConfirmOpen(false);
            setErrorModal({
                open: true,
                title: 'No se puede eliminar',
                message: err.response?.data?.detail || err.message
            });
        }
    };

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

    let filteredCategories = categories.filter(c => {
        if (filterStatus === 'true' && !c.activa) return false;
        if (filterStatus === 'false' && c.activa) return false;

        if (search) {
            const lowerSearch = removeAccents(search.toLowerCase());
            return (
                removeAccents(c.nombre.toLowerCase()).includes(lowerSearch) ||
                removeAccents(c.descripcion?.toLowerCase() || '').includes(lowerSearch)
            );
        }
        return true;
    });

    filteredCategories.sort((a, b) => {
        let valA = a[orderBy];
        let valB = b[orderBy];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return orderDir === 'asc' ? -1 : 1;
        if (valA > valB) return orderDir === 'asc' ? 1 : -1;
        return 0;
    });

    const displayCategories = filteredCategories.slice(page * limit, (page + 1) * limit);

    return (
        <>
            <div className="container animate-fade-in" style={{ padding: '40px 0' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Gestión de Categorías</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Organiza tus productos por familias.</p>
                    </div>
                    <button onClick={handleAddNew} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '15px', fontWeight: 700, background: 'var(--gradient-main)', color: 'white' }}>
                        + Nueva Categoría
                    </button>
                </header>

                {/* BARRA DE FILTROS */}
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', border: '1px solid var(--card-border)' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Buscar</label>
                        <input
                            type="text"
                            placeholder="Nombre o descripción..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                        />
                    </div>

                    <div style={{ width: '220px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                        >
                            <option value="">Todas</option>
                            <option value="true">Activas</option>
                            <option value="false">Ocultas</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { setSearch(''); setFilterStatus(''); setPage(0); setOrderBy('nombre'); setOrderDir('asc'); }}
                        style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '13px' }}
                    >
                        Limpiar
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--card-border)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    Nombre <SortIndicator column="nombre" />
                                </th>
                                <th onClick={() => handleSort('descripcion')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    Descripción <SortIndicator column="descripcion" />
                                </th>
                                <th onClick={() => handleSort('activa')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    Estado <SortIndicator column="activa" />
                                </th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Cargando catálogo...</td>
                                </tr>
                            ) : displayCategories.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 700 }}>{c.nombre}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{c.descripcion || 'Sin descripción'}</td>
                                    <td>
                                        <span className={`badge ${c.activa ? 'badge-success' : 'badge-danger'}`}>
                                            {c.activa ? 'Activa' : 'Oculta'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(c)} className="btn-action">Editar</button>
                                            {c.activa ? (
                                                <button onClick={() => openConfirm('soft', c.id)} className="btn-action">Ocultar</button>
                                            ) : (
                                                <button onClick={() => openConfirm('hard', c.id)} className="btn-action btn-delete">Eliminar</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {(!loading && filteredCategories.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No se encontraron categorías con estos filtros.
                        </div>
                    )}

                    {/* PAGINACIÓN */}
                    {filteredCategories.length > 0 && (
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
                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, padding: '0 15px' }}>
                                Pág. {page + 1} de {Math.ceil(filteredCategories.length / limit) || 1}
                            </span>
                            <button
                                disabled={(page + 1) * limit >= filteredCategories.length}
                                onClick={() => setPage(page + 1)}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', background: 'var(--navbar-bg)',
                                    color: (page + 1) * limit >= filteredCategories.length ? 'var(--text-muted)' : 'var(--text-main)', border: '1px solid var(--card-border)',
                                    cursor: (page + 1) * limit >= filteredCategories.length ? 'default' : 'pointer'
                                }}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALES FUERA DEL CONTAINER ANIMADO PARA CENTRADO ABSOLUTO */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
                onSave={fetchCategories}
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                title={confirmAction.type === 'soft' ? "¿Ocultar Categoría?" : "¿Borrar Categoría?"}
                message={confirmAction.type === 'soft'
                    ? "La categoría dejará de ser visible en la web, pero los productos se mantendrán."
                    : "Esta acción eliminará permanentemente la categoría. Solo es posible si no tiene productos asociados."
                }
                onConfirm={handleConfirmAction}
                onCancel={() => setIsConfirmOpen(false)}
            />

            <ConfirmModal
                isOpen={errorModal.open}
                title={errorModal.title}
                message={errorModal.message}
                hideCancel={true}
                onConfirm={() => setErrorModal({ ...errorModal, open: false })}
            />
        </>
    );
};

export default AdminCategories;
