import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const ProductModal = ({ product, isOpen, onClose, onSave }) => {
    const [categories, setCategories] = useState([]);
    const [existingMaterials, setExistingMaterials] = useState([]);

    // Estados para creación rápida
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewMaterialInput, setShowNewMaterialInput] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria_id: '',
        material: '',
        peso_gramos: 0,
        dimensiones: '',
        tiempo_impresion_horas: 0,
        stock: 0,
        activo: true
    });

    const fetchData = async () => {
        try {
            const [catRes, matRes] = await Promise.all([
                api.get('/categorias/'),
                api.get('/productos/materiales')
            ]);
            setCategories(catRes.data);
            setExistingMaterials(matRes.data);
        } catch (err) {
            console.error('Error fetching modal data:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setShowNewCategoryInput(false);
            setShowNewMaterialInput(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                categoria_id: product.categoria_id || ''
            });
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                precio: 0,
                categoria_id: '',
                material: '',
                peso_gramos: 0,
                dimensiones: '',
                tiempo_impresion_horas: 0,
                stock: 0,
                activo: true
            });
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await api.post('/categorias/', { nombre: newCategoryName });
            setCategories([...categories, res.data]);
            setFormData({ ...formData, categoria_id: res.data.id });
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } catch (err) {
            alert('Error añadiendo categoría');
        }
    };

    const handleAddMaterial = () => {
        if (!newMaterialName.trim()) return;
        // Solo lo añadimos a la lista visual de esta sesión
        if (!existingMaterials.includes(newMaterialName)) {
            setExistingMaterials([...existingMaterials, newMaterialName]);
        }
        setFormData({ ...formData, material: newMaterialName });
        setNewMaterialName('');
        setShowNewMaterialInput(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.categoria_id) {
            alert('Por favor selecciona una categoría');
            return;
        }
        try {
            if (product?.id) {
                await api.put(`/productos/${product.id}`, formData);
            } else {
                await api.post('/productos/', formData);
            }
            onSave();
            onClose();
        } catch (err) {
            alert('Error guardando producto: ' + (err.response?.data?.detail || err.message));
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 100000, backdropFilter: 'blur(15px)',
            padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                padding: '40px', width: '100%', maxWidth: '750px',
                maxHeight: '90vh', overflowY: 'auto',
                border: '1px solid var(--card-border)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                background: 'var(--navbar-bg)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{product ? 'Editar Modelo 3D' : 'Añadir al Inventario'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '32px', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre Comercial *</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} required autoFocus style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción del Producto</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    {/* CATEGORÍA */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Categoría *</label>
                            <button type="button" onClick={() => setShowNewCategoryInput(!showNewCategoryInput)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 800 }}>{showNewCategoryInput ? 'Cancelar' : '+ Nueva'}</button>
                        </div>
                        {showNewCategoryInput ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input placeholder="Nombre..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(58, 134, 255, 0.1)', color: 'white', border: '1px solid var(--primary)' }} />
                                <button type="button" onClick={handleAddCategory} style={{ padding: '0 15px', background: 'var(--primary)', borderRadius: '10px', color: 'white', fontWeight: 700 }}>Crear</button>
                            </div>
                        ) : (
                            <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'var(--background)', color: 'white', border: '1px solid var(--card-border)' }}>
                                <option value="">Seleccionar...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* MATERIAL - AHORA IGUAL QUE CATEGORÍA */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Material *</label>
                            <button type="button" onClick={() => setShowNewMaterialInput(!showNewMaterialInput)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 800 }}>{showNewMaterialInput ? 'Cancelar' : '+ Nuevo'}</button>
                        </div>
                        {showNewMaterialInput ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input placeholder="Ej: PLA+, Resina..." value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(58, 134, 255, 0.1)', color: 'white', border: '1px solid var(--primary)' }} />
                                <button type="button" onClick={handleAddMaterial} style={{ padding: '0 15px', background: 'var(--primary)', borderRadius: '10px', color: 'white', fontWeight: 700 }}>Añadir</button>
                            </div>
                        ) : (
                            <select name="material" value={formData.material} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'var(--background)', color: 'white', border: '1px solid var(--card-border)' }}>
                                <option value="">Seleccionar...</option>
                                {existingMaterials.sort().map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Precio Unitario (€) *</label>
                        <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock Actual</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '20px', padding: '15px 0', borderTop: '1px solid var(--card-border)', marginTop: '10px' }}>
                        <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                        <label style={{ fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Sincronizar con Catálogo Público</label>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '15px 35px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)', borderRadius: '15px', fontWeight: 700 }}>Cancelar</button>
                        <button type="submit" style={{ padding: '15px 50px', background: 'var(--gradient-main)', color: 'white', fontWeight: 800, borderRadius: '15px', boxShadow: '0 8px 25px var(--primary-glow)', border: 'none', cursor: 'pointer' }}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
