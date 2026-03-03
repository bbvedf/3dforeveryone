import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const CategoryModal = ({ category, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        activa: true
    });

    useEffect(() => {
        if (category) {
            setFormData(category);
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                activa: true
            });
        }
    }, [category, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (category?.id) {
                await api.put(`/categorias/${category.id}`, formData);
            } else {
                await api.post('/categorias/', formData);
            }
            onSave();
            onClose();
        } catch (err) {
            alert('Error guardando categoría: ' + (err.response?.data?.detail || err.message));
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
                padding: '40px', width: '100%', maxWidth: '550px',
                border: '1px solid var(--card-border)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                background: 'var(--navbar-bg)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '32px', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre de la Sección *</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} required autoFocus style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Breve Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="3" style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px 0', borderTop: '1px solid var(--card-border)', marginTop: '5px' }}>
                        <input type="checkbox" name="activa" checked={formData.activa} onChange={handleChange} style={{ width: '22px', height: '22px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                        <label style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Habilitar visibilidad en la web pública</label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: '15px', fontWeight: 700 }}>Cancelar</button>
                        <button type="submit" style={{ padding: '15px 45px', background: 'var(--gradient-main)', color: 'white', fontWeight: 800, borderRadius: '15px', border: 'none', boxShadow: '0 8px 25px var(--primary-glow)', cursor: 'pointer' }}>Guardar Categoría</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
