import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const ProductModal = ({ product, isOpen, onClose, onSave }) => {
    const [categories, setCategories] = useState([]);
    const [existingMaterials, setExistingMaterials] = useState([]);

    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewMaterialInput, setShowNewMaterialInput] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
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
            const catPromise = api.get('/categorias/').catch(e => { console.error("Error cat:", e); return { data: [] }; });
            const matPromise = api.get('/productos/materiales').catch(e => { console.error("Error mat:", e); return { data: [] }; });

            const [catRes, matRes] = await Promise.all([catPromise, matPromise]);

            setCategories(catRes.data || []);
            setExistingMaterials(matRes.data || []);
        } catch (err) {
            console.error('Error fetching modal data:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setShowNewCategoryInput(false);
            setShowNewMaterialInput(false);
            setSelectedFile(null);
            setImagePreview(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                categoria_id: product.categoria_id || ''
            });
            if (product.imagen_url) {
                // Asumimos que la URL es relativa y que la API corre en el puerto 8000
                // O mejor, usamos el baseURL de la instancia de api si está configurado para incluir el host
                // Por simplicidad, si la imagen_url empieza por / la tratamos como absoluta al servidor
                setImagePreview(`${product.imagen_url}`);
            }
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
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

        setUploading(true);
        try {
            let productId = product?.id;
            if (productId) {
                await api.put(`/productos/${productId}`, formData);
            } else {
                const res = await api.post('/productos/', formData);
                productId = res.data.id;
            }

            // Subir imagen si hay una seleccionada
            if (selectedFile && productId) {
                const formDataFile = new FormData();
                formDataFile.append('file', selectedFile);
                await api.post(`/uploads/producto/${productId}`, formDataFile, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            onSave();
            onClose();
        } catch (err) {
            alert('Error guardando producto: ' + (err.response?.data?.detail || err.message));
        } finally {
            setUploading(false);
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
            <div className="glass-panel modal-panel animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{product ? 'Editar Modelo 3D' : 'Añadir al Inventario'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '32px', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="stack-mobile modal-grid">
                    <div className="modal-fields">
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre Comercial *</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange} required autoFocus style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Categoría *</label>
                                <button type="button" onClick={() => setShowNewCategoryInput(!showNewCategoryInput)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 800 }}>{showNewCategoryInput ? 'Cancelar' : '+ Nueva'}</button>
                            </div>
                            {showNewCategoryInput ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input placeholder="Nombre..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(58, 134, 255, 0.1)', color: 'var(--text-main)', border: '1px solid var(--primary)' }} />
                                    <button type="button" onClick={handleAddCategory} style={{ padding: '0 15px', background: 'var(--primary)', borderRadius: '10px', color: 'white', fontWeight: 700 }}>Crear</button>
                                </div>
                            ) : (
                                <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px' }}>
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Material *</label>
                                <button type="button" onClick={() => setShowNewMaterialInput(!showNewMaterialInput)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 800 }}>{showNewMaterialInput ? 'Cancelar' : '+ Nuevo'}</button>
                            </div>
                            {showNewMaterialInput ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input placeholder="Ej: PLA+, Resina..." value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(58, 134, 255, 0.1)', color: 'var(--text-main)', border: '1px solid var(--primary)' }} />
                                    <button type="button" onClick={handleAddMaterial} style={{ padding: '0 15px', background: 'var(--primary)', borderRadius: '10px', color: 'white', fontWeight: 700 }}>Añadir</button>
                                </div>
                            ) : (
                                <select name="material" value={formData.material} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'var(--background)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '14px' }}>
                                    <option value="">Seleccionar...</option>
                                    {existingMaterials.sort().map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Precio (€) *</label>
                            <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Stock</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: IMAGEN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Imagen del Producto</label>
                        <div style={{
                            width: '100%', aspectRatio: '1/1', borderRadius: '20px',
                            background: 'rgba(255,255,255,0.03)', border: '2px dashed var(--card-border)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            overflow: 'hidden', position: 'relative', cursor: 'pointer'
                        }}
                            onClick={() => document.getElementById('product-image-input').click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🖼️</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click para subir</div>
                                </div>
                            )}
                        </div>
                        <input
                            id="product-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Recomendado: 800x800px WebP/PNG/JPG (Máx 5MB)</p>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderTop: '1px solid var(--card-border)', marginTop: '10px' }}>
                        <input type="checkbox" id="activo-check" name="activo" checked={formData.activo} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                        <label htmlFor="activo-check" style={{ fontSize: '15px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>Visible en el catálogo público</label>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: '15px', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                        <button
                            type="submit"
                            disabled={uploading}
                            style={{
                                padding: '15px 45px', background: 'var(--gradient-main)', color: 'white',
                                fontWeight: 800, borderRadius: '15px', boxShadow: '0 8px 25px var(--primary-glow)',
                                border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1
                            }}
                        >
                            {uploading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
