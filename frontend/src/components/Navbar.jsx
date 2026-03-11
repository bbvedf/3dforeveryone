import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

// Logos
import logoDark from '../assets/logo_dark.png';
import logoLight from '../assets/logo_light.png';

// --- ICONOS SVG (Cambiados fuera para HMR estable) ---
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

const CategoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
);

const InventoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-container-icon lucide-container"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z" /><path d="M10 21.9V14L2.1 9.1" /><path d="m10 14 11.9-6.9" /><path d="M14 19.8v-8.1" /><path d="M18 17.5V9.4" /></svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const OrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
);

// --- ESTILOS COMPARTIDOS ---
const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: '600',
    padding: '12px 15px',
    borderRadius: '12px',
    color: 'var(--text-main)',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
};

const linkHoverEnter = (e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.transform = 'translateX(5px)';
    e.currentTarget.style.color = 'var(--primary)';
};

const linkHoverLeave = (e) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.color = 'var(--text-main)';
};

const adminLinkHoverEnter = (e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.transform = 'translateX(5px)';
    e.currentTarget.style.color = 'var(--accent)';
};

const adminLinkHoverLeave = (e) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.color = 'var(--accent)';
};

const adminLinkStyle = {
    ...linkStyle,
    color: 'var(--accent)'
};

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { totalItems, toggleCart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <nav style={{
                margin: '20px', padding: '0 30px', height: 'var(--header-height)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: '10px', zIndex: 500,
                transition: 'all 0.3s ease',
                background: 'var(--navbar-bg)', // Color exacto del logo
                border: '1px solid var(--card-border)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                {/* LOGO */}
                <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={isDark ? logoDark : logoLight}
                        alt="3D4EVERYONE"
                        style={{
                            height: '65px',
                            objectFit: 'contain',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* CARRITO */}
                    <button
                        onClick={toggleCart}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)',
                            width: '50px', height: '50px', borderRadius: '15px', color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                            cursor: 'pointer', transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
                    >
                        <CartIcon />
                        {totalItems > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: 'var(--primary)', color: 'white', fontSize: '11px',
                                fontWeight: 900, width: '20px', height: '20px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 10px var(--primary-glow)', border: '2px solid var(--background)'
                            }}>
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* BOTÓN HAMBURGUESA */}
                    <button
                        onClick={toggleMenu}
                        style={{
                            background: 'var(--gradient-main)', width: '50px', height: '50px',
                            display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 15px var(--primary-glow)', border: 'none', borderRadius: '15px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ width: '24px', height: '2.5px', background: 'white', borderRadius: '2px', transform: isMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none', transition: '0.3s' }}></div>
                        {!isMenuOpen && <div style={{ width: '24px', height: '2.5px', background: 'white', borderRadius: '2px' }}></div>}
                        <div style={{ width: '24px', height: '2.5px', background: 'white', borderRadius: '2px', transform: isMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none', transition: '0.3s' }}></div>
                    </button>
                </div>
            </nav>

            {/* DRAWER 🍔 (Responde dinámicamente al fondo del tema) */}
            <div style={{
                position: 'fixed', top: 0, right: isMenuOpen ? 0 : '-100%',
                width: '320px', height: '100vh',
                background: 'var(--background)', // Sincronizado con el tema
                borderLeft: '1px solid var(--card-border)', padding: '40px 30px',
                zIndex: 2000,
                transition: 'right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column', gap: '0px',
                boxShadow: isMenuOpen ? `-30px 0 60px ${isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.1)'}` : 'none',
                color: 'var(--text-main)'
            }}>
                <button onClick={toggleMenu} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '28px', cursor: 'pointer', marginBottom: '20px' }}>&times;</button>

                <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>Navegación</h3>

                <Link to="/" onClick={toggleMenu} style={linkStyle}
                    onMouseEnter={linkHoverEnter}
                    onMouseLeave={linkHoverLeave}>
                    <HomeIcon /> Catálogo
                </Link>

                {user && (
                    <Link to="/mis-pedidos" onClick={toggleMenu} style={linkStyle}
                        onMouseEnter={linkHoverEnter}
                        onMouseLeave={linkHoverLeave}>
                        <OrdersIcon /> Mis Pedidos
                    </Link>
                )}

                {isAdmin && (
                    <>
                        <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', marginTop: '20px' }}>Administración</h3>
                        <Link to="/admin" onClick={toggleMenu} style={adminLinkStyle}
                            onMouseEnter={adminLinkHoverEnter}
                            onMouseLeave={adminLinkHoverLeave}>
                            <AdminIcon /> Dashboard
                        </Link>
                        <Link to="/admin/inventario" onClick={toggleMenu} style={adminLinkStyle}
                            onMouseEnter={adminLinkHoverEnter}
                            onMouseLeave={adminLinkHoverLeave}>
                            <InventoryIcon /> Inventario
                        </Link>
                        <Link to="/admin/categorias" onClick={toggleMenu} style={adminLinkStyle}
                            onMouseEnter={adminLinkHoverEnter}
                            onMouseLeave={adminLinkHoverLeave}>
                            <CategoryIcon /> Categorías
                        </Link>
                        <Link to="/admin/pedidos" onClick={toggleMenu} style={adminLinkStyle}
                            onMouseEnter={adminLinkHoverEnter}
                            onMouseLeave={adminLinkHoverLeave}>
                            <OrdersIcon /> Pedidos
                        </Link>
                        <Link to="/admin/clientes" onClick={toggleMenu} style={adminLinkStyle}
                            onMouseEnter={adminLinkHoverEnter}
                            onMouseLeave={adminLinkHoverLeave}>
                            <ProfileIcon /> Clientes
                        </Link>
                    </>
                )}

                <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', marginBottom: '20px', marginTop: '20px' }} />

                    <h3 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', marginTop: '20px' }}>Preferencias</h3>
                    <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '18px', fontWeight: 600, padding: '12px 15px', borderRadius: '12px', color: 'var(--text-main)', transition: 'all 0.2s ease', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                        {isDark ? <SunIcon /> : <MoonIcon />}
                        Modo {isDark ? 'Claro' : 'Oscuro'}
                    </div>

                    {user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <Link to="/perfil" onClick={toggleMenu} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: '600', padding: '12px 15px', borderRadius: '12px', color: 'var(--text-main)', transition: 'all 0.2s ease', textDecoration: 'none' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    background: 'var(--gradient-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    color: 'white'
                                }}>
                                    {user.avatar_url ? (
                                        <img src={`${user.avatar_url}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user.nombre[0].toUpperCase()
                                    )}
                                </div>
                                {user.nombre}
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{ width: '100%', padding: '16px', borderRadius: '15px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', fontWeight: 700, border: 'none' }}
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" onClick={toggleMenu}>
                            <button style={{ width: '100%', padding: '18px', borderRadius: '15px', background: 'var(--gradient-main)', color: 'white', fontWeight: 800, fontSize: '16px', border: 'none' }}>
                                Iniciar Sesión
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            {/* OVERLAY TIPO MASK */}
            {isMenuOpen && (
                <div
                    onClick={toggleMenu}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1500, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
                ></div>
            )}
        </>
    );
};

export default Navbar;
