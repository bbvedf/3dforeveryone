import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-panel" style={{
            margin: '20px',
            padding: '0 40px',
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: '10px',
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <Link to="/" style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    background: 'var(--gradient-main)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px'
                }}>
                    3D4EVERYONE
                </Link>
                <div style={{ display: 'flex', gap: '20px', fontSize: '15px' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)' }}>Catálogo</Link>
                    <Link to="/categorias" style={{ color: 'var(--text-muted)' }}>Categorías</Link>
                    {isAdmin && (
                        <Link to="/admin" style={{ color: 'var(--accent)', fontWeight: 600 }}>Admin Panel</Link>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user ? (
                    <>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Hola, <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.nombre}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 18px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--card-border)',
                                fontSize: '14px'
                            }}
                        >
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <Link to="/login">
                        <button style={{
                            padding: '10px 24px',
                            background: 'var(--gradient-main)',
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 4px 15px var(--primary-glow)',
                            fontSize: '14px'
                        }}>
                            Entrar
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
