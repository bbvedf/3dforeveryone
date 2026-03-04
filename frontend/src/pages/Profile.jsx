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
        pais: '',
        contraseña: '',
        confirmarContraseña: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                telefono: user.telefono || '',
                direccion: user.direccion || '',
                ciudad: user.ciudad || '',
                codigo_postal: user.codigo_postal || '',
                pais: user.pais || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // Validar contraseñas si el usuario intenta cambiarlas
        if (showPasswordChange) {
            if (!formData.contraseña) {
                setMessage({ type: 'error', text: 'Introduce la nueva contraseña o cancela el cambio.' });
                return;
            }
            if (formData.contraseña !== formData.confirmarContraseña) {
                setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
                return;
            }
        }

        setLoading(true);
        try {
            const dataToSave = { ...formData };
            if (!showPasswordChange) {
                delete dataToSave.contraseña;
            }
            delete dataToSave.confirmarContraseña;

            await api.put(`/clientes/${user.id}`, dataToSave);

            setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
            updateUser({ ...user, ...formData });

            // Limpiar campos de password por seguridad
            setFormData(prev => ({ ...prev, contraseña: '', confirmarContraseña: '' }));
            setShowPasswordChange(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Error al actualizar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <div className="glass-panel" style={{
                padding: '50px',
                maxWidth: '900px',
                margin: '0 auto',
                border: '1px solid var(--card-border)',
                boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
                background: 'var(--navbar-bg)'
            }}>
                <header style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: 'var(--gradient-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        margin: '0 auto 20px',
                        fontWeight: 900,
                        color: 'white',
                        boxShadow: '0 10px 30px var(--primary-glow)',
                        textTransform: 'uppercase'
                    }}>
                        {user?.nombre?.[0] || 'U'}
                    </div>
                    <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '10px', color: 'var(--text-main)' }}>Mi Cuenta</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Gestiona tus credenciales y preferencias de envío.</p>
                </header>

                {message && (
                    <div className="animate-fade-in" style={{
                        padding: '18px',
                        borderRadius: '15px',
                        marginBottom: '35px',
                        backgroundColor: message.type === 'success' ? 'rgba(0, 255, 100, 0.08)' : 'rgba(255, 50, 50, 0.08)',
                        color: message.type === 'success' ? '#00ff64' : '#ff4444',
                        textAlign: 'center',
                        border: `1px solid ${message.type === 'success' ? 'rgba(0, 255, 100, 0.2)' : 'rgba(255, 50, 50, 0.2)'}`,
                        fontWeight: 600
                    }}>
                        {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre completo *</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email (Principal)</label>
                            <input value={user?.email || ''} disabled style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', color: 'var(--text-muted)', border: '1px solid var(--card-border)', cursor: 'not-allowed', opacity: 0.7 }} />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dirección de Envío 📦</label>
                            <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, número, piso..." style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ciudad</label>
                            <input name="ciudad" value={formData.ciudad} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>País</label>
                            <input name="pais" value={formData.pais} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)' }} />
                        </div>
                    </div>

                    {/* SECCIÓN CAMBIAR CONTRASEÑA */}
                    <div style={{
                        padding: '25px',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--card-border)',
                        marginBottom: '40px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPasswordChange ? '25px' : '0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Seguridad de la Cuenta</h3>
                            <button
                                type="button"
                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                                style={{ background: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer' }}
                            >
                                {showPasswordChange ? 'Cancelar cambio' : 'Cambiar Contraseña →'}
                            </button>
                        </div>

                        {showPasswordChange && (
                            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Nueva Contraseña</label>
                                    <input name="contraseña" type="password" value={formData.contraseña} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--primary)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Repetir Contraseña</label>
                                    <input name="confirmarContraseña" type="password" value={formData.confirmarContraseña} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--primary)' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        padding: '22px',
                        borderRadius: '18px',
                        background: 'var(--gradient-main)',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '18px',
                        boxShadow: '0 12px 35px var(--primary-glow)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        border: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {loading ? 'Actualizando tu perfil...' : 'Guardar Todos los Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
