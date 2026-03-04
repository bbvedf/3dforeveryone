import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import ConfirmModal from '../components/ConfirmModal';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        contraseña: '',
        confirmarContraseña: '',
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
    const [successModal, setSuccessModal] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        // Validación manual para evitar los tooltips del navegador en inglés
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Por favor, introduce un correo electrónico válido.');
            return false;
        }
        if (formData.contraseña.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        if (formData.contraseña !== formData.confirmarContraseña) {
            setError('Las contraseñas no coinciden.');
            return false;
        }
        if (formData.nombre.trim().length < 2) {
            setError('Por favor, introduce un nombre válido.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        setLoading(true);

        try {
            await api.post('/clientes/registro', {
                email: formData.email,
                contraseña: formData.contraseña,
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono,
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                codigo_postal: formData.codigo_postal,
                pais: formData.pais
            });
            setSuccessModal(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Error en el registro. Revisa los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="glass-panel animate-fade-in" style={{
                padding: '50px',
                width: '100%',
                maxWidth: '650px',
                border: '1px solid var(--card-border)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                background: 'var(--navbar-bg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '10px', color: 'var(--text-main)' }}>Únete a <span style={{ color: 'var(--primary)' }}>3D4E</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Crea tu cuenta técnica y empieza a imprimir piezas únicas.</p>
                </div>

                {error && (
                    <div className="animate-fade-in" style={{
                        padding: '16px',
                        background: 'rgba(255, 50, 50, 0.1)',
                        color: '#ff3232',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        fontSize: '14px',
                        border: '1px solid rgba(255, 50, 50, 0.2)',
                        textAlign: 'center',
                        fontWeight: 600
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Correo Electrónico *</label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Contraseña *</label>
                        <input name="contraseña" type="password" required value={formData.contraseña} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirmar Password *</label>
                        <input name="confirmarContraseña" type="password" required value={formData.confirmarContraseña} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2', height: '1px', background: 'var(--card-border)', margin: '10px 0' }}></div>

                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre *</label>
                        <input name="nombre" required value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Apellido</label>
                        <input name="apellido" value={formData.apellido} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Teléfono móvil</label>
                        <input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Ciudad / Localidad</label>
                        <input name="ciudad" value={formData.ciudad} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Dirección de Envío Completa</label>
                        <input name="direccion" value={formData.direccion} onChange={handleChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', border: '1px solid var(--card-border)', outline: 'none' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        gridColumn: 'span 2',
                        padding: '20px',
                        borderRadius: '15px',
                        background: 'var(--gradient-main)',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '18px',
                        marginTop: '20px',
                        boxShadow: '0 10px 30px var(--primary-glow)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        border: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {loading ? 'Procesando registro...' : 'Crear Mi Cuenta'}
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '15px', color: 'var(--text-muted)' }}>
                    ¿Ya eres miembro? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Inicia Sesión aquí</Link>
                </p>
            </div>

            {/* MODAL DE ÉXITO */}
            <ConfirmModal
                isOpen={successModal}
                title="¡Cuenta Creada!"
                message="Tu registro se ha completado correctamente. Ya puedes acceder con tu email y contraseña."
                type="success"
                hideCancel={true}
                onConfirm={() => navigate('/login')}
            />
        </div>
    );
};

export default Register;
