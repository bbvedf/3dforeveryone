import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Solo productos que SÍ están a la venta
                const response = await api.get('/productos/?activo=true');
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="animate-spin" style={{
                width: '40px', height: '40px',
                border: '4px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%'
            }}></div>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
            <header style={{ margin: '40px 0', textAlign: 'center' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '10px' }}>
                    Explora Diseños <span style={{ color: 'var(--primary)' }}>3D</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
                    Piezas únicas impresas con la mejor calidad industrial.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
                marginTop: '20px'
            }}>
                {products.map(product => (
                    <div key={product.id} className="glass-panel" style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'transform 0.3s ease, border-color 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--card-border)';
                        }}>
                        {/* Imagen placeholder ya que no hay en backend aún */}
                        <div style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '12px',
                            background: 'linear-gradient(45deg, #1e293b, #0f172a)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px'
                        }}>
                            📦
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{product.nombre}</h3>
                                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                                    {product.material}
                                </span>
                            </div>
                            <span style={{
                                background: 'rgba(58, 134, 255, 0.1)',
                                color: 'var(--primary)',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '14px'
                            }}>
                                {product.precio.toFixed(2)}€
                            </span>
                        </div>

                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '14px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '42px'
                        }}>
                            {product.descripcion}
                        </p>

                        <button style={{
                            width: '100%',
                            padding: '12px',
                            marginTop: '10px',
                            background: 'white',
                            color: 'black',
                            fontWeight: 800,
                            fontSize: '14px'
                        }}>
                            Añadir al Carrito
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;
