import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/api';

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [addedId, setAddedId] = useState(null);

    const handleAddToCart = (product) => {
        addToCart(product);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    // Filtros
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCategory = queryParams.get('categoria') || '';

    const [filterCategory, setFilterCategory] = useState(initialCategory);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Cargar categorías para el filtro
            const catRes = await api.get('/categorias/');
            setCategories(catRes.data);

            // Cargar productos
            let url = '/productos/?activo=true';
            if (filterCategory) {
                url += `&categoria_id=${filterCategory}`;
            }
            const prodRes = await api.get(url);
            setProducts(prodRes.data);
        } catch (err) {
            console.error('Error fetching catalog data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterCategory]);

    // Si el parámetro de la URL cambia (ej: desde el menú), actualizamos el estado
    useEffect(() => {
        const newCat = queryParams.get('categoria') || '';
        if (newCat !== filterCategory) {
            setFilterCategory(newCat);
        }
    }, [location.search]);

    if (loading && products.length === 0) return (
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

            {/* FILTROS RÁPIDOS */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '40px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setFilterCategory('')}
                    className={filterCategory === '' ? 'btn-primary' : 'btn-action'}
                    style={{ padding: '8px 20px', borderRadius: '20px' }}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id.toString())}
                        className={filterCategory === cat.id.toString() ? 'btn-primary' : 'btn-action'}
                        style={{ padding: '8px 20px', borderRadius: '20px' }}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>

            {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    No hay productos en esta categoría por ahora.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {products.map(product => (
                        <div key={product.id} className="glass-panel" style={{
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                            onClick={() => navigate(`/producto/${product.id}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--card-border)';
                            }}>
                            <div style={{
                                width: '100%',
                                height: '200px',
                                borderRadius: '12px',
                                background: product.imagen_url ? 'none' : 'linear-gradient(45deg, #1e293b, #0f172a)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {product.imagen_url ? (
                                    <img
                                        src={`${product.imagen_url}`}
                                        alt={product.nombre}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    '📦'
                                )}
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

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontWeight: 700, borderRadius: '10px' }}>Detalles</button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                    }}
                                    style={{
                                        flex: 2,
                                        padding: '12px',
                                        background: addedId === product.id ? '#00ff64' : 'var(--gradient-main)',
                                        color: 'white',
                                        fontWeight: 800,
                                        borderRadius: '10px',
                                        border: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {addedId === product.id ? '¡Añadido! ✅' : '🛒 Añadir'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Catalog;
