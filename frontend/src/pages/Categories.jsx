import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categorias/');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>Explorando secciones...</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '20px' }}>Categorías Premium</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    Explora nuestra selección de modelos 3D organizados por familias de impresión.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '30px'
            }}>
                {categories.map(cat => (
                    <Link
                        key={cat.id}
                        to={`/?categoria=${cat.id}`}
                        className="glass-panel"
                        style={{
                            padding: '40px',
                            textDecoration: 'none',
                            color: 'var(--text-main)',
                            transition: 'all 0.3s ease',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '200px',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--card-border)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px', color: 'var(--primary)' }}>{cat.nombre}</h2>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{cat.descripcion || 'Explora todos los modelos de esta sección.'}</p>
                        <div style={{ marginTop: '20px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ver Modelos →</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
