import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/productos/${id}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Error al cargar producto", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        // Agregamos tantas veces como cantidad indicada (o modificamos CartContext para aceptar cantidad, pero como usa product entero, podemos iterar o modificar addToCart. Nuestro addToCart actual hace item = { ...product, cantidad: 1 } internamente si no existe, o suma 1. Para sumar N veces, podemos llamar addToCart N veces, o mejor: el CartContext.jsx ya maneja la lógica. Vamos a iterar.
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="animate-spin" style={{
                width: '50px', height: '50px',
                border: '4px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%'
            }}></div>
        </div>
    );

    if (!product) return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Producto no encontrado 😟</h2>
            <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '15px' }}>
                Volver al catálogo
            </button>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0', minHeight: '80vh' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '30px', fontWeight: 600
                }}
            >
                ← Volver
            </button>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '50px',
                alignItems: 'start'
            }}>
                {/* GALERÍA / IMAGEN */}
                <div className="glass-panel" style={{
                    borderRadius: '20px',
                    padding: '20px',
                    border: '1px solid var(--card-border)',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '500px',
                    overflow: 'hidden'
                }}>
                    {product.imagen_url ? (
                        <img
                            src={`${product.imagen_url}`}
                            alt={product.nombre}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))',
                                transition: 'transform 0.4s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    ) : (
                        <span style={{ fontSize: '100px', opacity: 0.5 }}>📦</span>
                    )}
                </div>

                {/* INFO DEL PRODUCTO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', padding: '10px 0' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <span style={{
                                background: 'rgba(58, 134, 255, 0.1)',
                                color: 'var(--primary)',
                                padding: '6px 14px',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '14px',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>
                                {product.categoria?.nombre || 'General'}
                            </span>
                            {product.stock > 0 ? (
                                <span style={{ color: '#00ff64', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#00ff64', borderRadius: '50%', boxShadow: '0 0 10px #00ff64' }}></span>
                                    En stock ({product.stock})
                                </span>
                            ) : (
                                <span style={{ color: '#ff4444', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#ff4444', borderRadius: '50%', boxShadow: '0 0 10px #ff4444' }}></span>
                                    Agotado
                                </span>
                            )}
                        </div>

                        <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '10px', lineHeight: '1.1' }}>
                            {product.nombre}
                        </h1>

                        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-main)', marginTop: '20px' }}>
                            {product.precio.toFixed(2)} <span style={{ fontSize: '24px', opacity: 0.8 }}>€</span>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '1px', background: 'var(--card-border)' }}></div>

                    {/* DETALLES TÉCNICOS */}
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Material</p>
                            <p style={{ fontSize: '18px', fontWeight: 600 }}>{product.material || 'Estándar'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>ID Producto</p>
                            <p style={{ fontSize: '18px', fontWeight: 600 }}>#{product.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '1px', background: 'var(--card-border)' }}></div>

                    {/* DESCRIPCIÓN */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Acerca de este diseño</h3>
                        <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
                            {product.descripcion || 'Sin descripción detallada. Una pieza excepcional impresa con tecnología de deposición fundida de alta resolución.'}
                        </p>
                    </div>

                    {/* ACCIONES */}
                    <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
                        {product.stock > 0 ? (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {/* CONTADOR DE CANTIDAD */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', background: 'var(--background)',
                                    border: '1px solid var(--card-border)', borderRadius: '15px', padding: '5px', gap: '15px'
                                }}>
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: 'var(--text-main)', fontSize: '20px', cursor: 'pointer' }}
                                    >-</button>
                                    <span style={{ fontSize: '18px', fontWeight: 800, width: '30px', textAlign: 'center' }}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: 'var(--text-main)', fontSize: '20px', cursor: 'pointer' }}
                                    >+</button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    style={{
                                        flex: 1,
                                        padding: '18px',
                                        background: added ? '#00ff64' : 'var(--gradient-main)',
                                        color: added ? '#000' : 'white',
                                        fontWeight: 800,
                                        fontSize: '18px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: added ? '0 10px 30px rgba(0,255,100,0.3)' : '0 10px 30px var(--primary-glow)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {added ? '¡Añadido al carrito! ✅' : 'Añadir al carrito 🛒'}
                                </button>
                            </div>
                        ) : (
                            <button
                                disabled
                                style={{
                                    width: '100%', padding: '18px', background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-muted)', fontWeight: 800, fontSize: '18px',
                                    borderRadius: '15px', border: '1px solid var(--card-border)', cursor: 'not-allowed'
                                }}
                            >
                                Producto Agotado 🚫
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
