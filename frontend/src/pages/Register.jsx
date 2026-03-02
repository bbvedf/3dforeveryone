import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        contraseña: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigo_postal: '',
        pais: 'España'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post('/clientes/registro', formData);
            alert('¡Registro completado! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error en el registro. Revisa los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '550px' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '10px', textAlign: 'center' }}>Crea tu Cuenta</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>Únete a la mayor tienda de modelos 3D.</p>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(255, 0, 0, 0.1)', color: '#ff4444', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Email *</label>
                        <input name="email" type="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Contraseña *</label>
                        <input name="contraseña" type="password" required value={formData.contraseña} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Nombre</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Apellido</label>
                        <input name="apellido" value={formData.apellido} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Teléfono</label>
                        <input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Ciudad</label>
                        <input name="ciudad" value={formData.ciudad} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Dirección</label>
                        <input name="direccion" value={formData.direccion} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        gridColumn: 'span 2', padding: '16px', borderRadius: '12px',
                        background: 'var(--gradient-main)', color: 'white',
                        fontWeight: 800, fontSize: '16px', marginTop: '10px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
