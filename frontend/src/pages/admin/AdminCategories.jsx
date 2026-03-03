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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Cargando catálogo...</div>
                ) : (
                    <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--card-border)' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(c => (
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
                    </div>
                )}
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
