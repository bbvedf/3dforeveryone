import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import ProductModal from './ProductModal';
import ConfirmModal from '../../components/ConfirmModal';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: '', id: null });
    const [editingProduct, setEditingProduct] = useState(null);

    // Filtros, Paginación y Ordenación
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMaterial, setFilterMaterial] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState('nombre');
    const [orderDir, setOrderDir] = useState('asc');
    const limit = 10;

    // Listas para filtros
    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);

    const fetchFiltersData = async () => {
        try {
            const [catRes, matRes] = await Promise.all([
                api.get('/categorias/'),
                api.get('/productos/materiales')
            ]);
            setCategories(catRes.data);
            setMaterials(matRes.data);
        } catch (err) {
            console.error('Error fetching filters data:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const offset = page * limit;
            let url = `/productos/?limit=${limit}&skip=${offset}&search=${search}&order_by=${orderBy}&order_dir=${orderDir}`;
            if (filterCategory) url += `&categoria_id=${filterCategory}`;
            if (filterMaterial) url += `&material=${filterMaterial}`;
            if (filterStatus !== '') url += `&activo=${filterStatus}`;

            const response = await api.get(url);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiltersData();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, search, filterCategory, filterMaterial, filterStatus, orderBy, orderDir]);

    const handleSort = (column) => {
        if (orderBy === column) {
            setOrderDir(orderDir === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(column);
            setOrderDir('asc');
        }
        setPage(0);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openConfirm = (type, id) => {
        setConfirmAction({ type, id });
        setIsConfirmModalOpen(true);
    };

    const handleConfirmAction = async () => {
        try {
            if (confirmAction.type === 'soft') {
                await api.delete(`/productos/${confirmAction.id}`);
            } else if (confirmAction.type === 'hard') {
                await api.delete(`/productos/${confirmAction.id}/eliminar`);
            }
            setIsConfirmModalOpen(false);
            fetchProducts();
            fetchFiltersData();
        } catch (err) {
            alert('Error en la operación: ' + (err.response?.data?.detail || err.message));
        }
    };

    const SortIndicator = ({ column }) => {
        if (orderBy !== column) return <span style={{ opacity: 0.3, marginLeft: '5px' }}>↕</span>;
        return <span style={{ marginLeft: '5px', color: 'var(--primary)' }}>{orderDir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <>
            <div className="container animate-fade-in" style={{ padding: '40px 0' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>Gestión de Inventario</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Control de modelos 3D y materiales.</p>
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

                {/* BARRA DE FILTROS TIPO EXCEL */}
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', border: '1px solid var(--card-border)' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Búsqueda</label>
                        <input
                            type="text"
                            placeholder="Nombre del producto..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                        />
                    </div>

                    <div style={{ width: '180px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                        >
                            <option value="">Todas</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>

                    <div style={{ width: '180px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Material</label>
                        <select
                            value={filterMaterial}
                            onChange={(e) => { setFilterMaterial(e.target.value); setPage(0); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                        >
                            <option value="">Todos</option>
                            {materials.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Estado</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }}
                        >
                            <option value="">Cualquiera</option>
                            <option value="true">Visibles</option>
                            <option value="false">Ocultos</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { setSearch(''); setFilterCategory(''); setFilterMaterial(''); setFilterStatus(''); setPage(0); setOrderBy('nombre'); setOrderDir('asc'); }}
                        style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '13px' }}
                    >
                        Limpiar
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Cargando inventario...</div>
                ) : (
                    <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto', border: '1px solid var(--card-border)' }}>
                        <table style={{ minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Foto</th>
                                    <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Producto <SortIndicator column="nombre" />
                                    </th>
                                    <th onClick={() => handleSort('categoria')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Categoría <SortIndicator column="categoria" />
                                    </th>
                                    <th onClick={() => handleSort('material')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Material <SortIndicator column="material" />
                                    </th>
                                    <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Stock <SortIndicator column="stock" />
                                    </th>
                                    <th onClick={() => handleSort('precio')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Precio <SortIndicator column="precio" />
                                    </th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No se encontraron productos con estos filtros.</td>
                                    </tr>
                                ) : products.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: 'var(--gradient-main)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {p.imagen_url ? (
                                                    <img src={`${p.imagen_url}`} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    '📦'
                                                )}
                                            </div>
                                        </td>
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
                                                {p.activo ? 'Visible' : 'Oculto'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => handleEdit(p)} className="btn-action">Editar</button>
                                                {p.activo ? (
                                                    <button onClick={() => openConfirm('soft', p.id)} className="btn-action">Ocultar</button>
                                                ) : (
                                                    <button onClick={() => openConfirm('hard', p.id)} className="btn-action btn-delete" style={{ color: '#ff4444' }}>Eliminar</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                                disabled={products.length < limit}
                                onClick={() => setPage(page + 1)}
                                style={{
                                    padding: '10px 20px', borderRadius: '10px', background: 'var(--navbar-bg)',
                                    color: products.length < limit ? 'var(--text-muted)' : 'var(--text-main)', border: '1px solid var(--card-border)',
                                    cursor: products.length < limit ? 'default' : 'pointer'
                                }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={editingProduct}
                onSave={fetchProducts}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title={confirmAction.type === 'soft' ? "¿Ocultar producto?" : "¿Eliminar permanentemente?"}
                message={confirmAction.type === 'soft'
                    ? "El producto dejará de verse en la tienda, pero conservaremos sus datos."
                    : "Esta acción NO se puede deshacer. El producto se borrará de la base de datos para siempre."
                }
                onConfirm={handleConfirmAction}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </>
    );
};

export default AdminProducts;
