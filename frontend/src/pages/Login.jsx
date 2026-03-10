import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - var(--header-height) - 100px)'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                padding: '50px',
                width: '100%',
                maxWidth: '450px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Inicia Sesión</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Bienvenido de nuevo a 3D4EVERYONE</p>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 0, 0, 0.1)',
                        color: '#ff4444',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@3dforeveryone.com"
                            style={{
                                width: '100%', padding: '15px', borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--card-border)',
                                color: 'var(--text-main)', outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '15px', borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--card-border)',
                                color: 'var(--text-main)', outline: 'none'
                            }}
                        />
                    </div>

                    <button type="submit" style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'var(--gradient-main)', color: 'white',
                        fontWeight: 800, fontSize: '16px', marginTop: '10px',
                        boxShadow: '0 8px 25px var(--primary-glow)'
                    }}>
                        Acceder
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--primary)', fontWeight: 600 }}>Regístrate gratis</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
