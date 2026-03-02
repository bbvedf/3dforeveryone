import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigo_postal: '',
        pais: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                telefono: user.telefono || '',
                direccion: user.direccion || '',
                ciudad: user.ciudad || '',
                codigo_postal: user.codigo_postal || '',
                pais: user.pais || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await api.put(`/clientes/${user.id}`, formData);
            setMessage({ type: 'success', text: '¡Datos actualizados correctamente!' });
            updateUser(formData);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Error al actualizar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Mi Perfil</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestiona tu información de contacto y direcciones.</p>
                </header>

                {message && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '30px',
                        backgroundColor: message.type === 'success' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        color: message.type === 'success' ? '#00ff64' : '#ff4444',
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Nombre</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Apellido</label>
                        <input name="apellido" value={formData.apellido} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Email (No editable)</label>
                        <input value={user?.email || ''} disabled style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', border: '1px solid var(--card-border)', cursor: 'not-allowed' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Teléfono</label>
                        <input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Dirección de Envío</label>
                        <input name="direccion" value={formData.direccion} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Ciudad</label>
                        <input name="ciudad" value={formData.ciudad} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Código Postal</label>
                        <input name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        gridColumn: 'span 2', padding: '18px', borderRadius: '15px',
                        background: 'var(--gradient-main)', color: 'white',
                        fontWeight: 800, fontSize: '16px', marginTop: '20px',
                        boxShadow: '0 8px 25px var(--primary-glow)',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Guardando...' : 'Actualizar Perfil'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
