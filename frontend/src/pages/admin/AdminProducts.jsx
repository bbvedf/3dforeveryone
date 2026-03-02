import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import ProductModal from './ProductModal';
import ConfirmModal from '../../components/ConfirmModal';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProductId, setDeletingProductId] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/productos/?limit=100');
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const confirmDelete = (id) => {
        setDeletingProductId(id);
        setIsConfirmModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/productos/${deletingProductId}`);
            setIsConfirmModalOpen(false);
            fetchProducts();
        } catch (err) {
            alert('Error al desactivar: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <>
            <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Gestión de Inventario</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Panel central de modelos 3D.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        style={{
                            padding: '14px 28px', background: 'var(--gradient-main)', color: 'white',
                            fontWeight: 700, borderRadius: '15px', boxShadow: '0 8px 25px var(--primary-glow)',
                            border: 'none', cursor: 'pointer', fontSize: '16px'
                        }}
                    >
                        + Añadir Modelo
                    </button>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>Cargando inventario...</div>
                ) : (
                    <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto', border: '1px solid var(--card-border)' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Material</th>
                                    <th>Stock</th>
                                    <th>Precio</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ fontWeight: 700, fontSize: '16px' }}>{p.nombre}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{p.id}</div>
                                        </td>
                                        <td>{p.categoria?.nombre || 'General'}</td>
                                        <td>{p.material || 'N/A'}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{p.stock} uds.</div>
                                        </td>
                                        <td>{p.precio.toFixed(2)}€</td>
                                        <td>
                                            <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>
                                                {p.activo ? 'Activo' : 'Cerrado'}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => handleEdit(p)} className="btn-action">Editar</button>
                                            {p.activo && (
                                                <button onClick={() => confirmDelete(p.id)} className="btn-action btn-delete">Ocultar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODALES Fuera del div animado */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={editingProduct}
                onSave={fetchProducts}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="¿Ocultar producto?"
                message="El producto dejará de estar visible en el catálogo público, pero mantendrás sus datos registrados."
                onConfirm={handleDelete}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </>
    );
};

export default AdminProducts;
