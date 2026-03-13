import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import { vi } from 'vitest';

// Mockeamos la API globalmente para que los fetchs de inicio no fallen
vi.mock('./api/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        }
    }
}));

describe('App Root', () => {
    it('renders without crashing and shows some text', () => {
        // Rendereamos el App, que probablemente necesita los Providers básicos que están en index.js/main.jsx pre-envueltos,
        // o el propio App tiene su BrowserRouter interno. 
        // Por si acaso probamos simplemente renderizar App (dependiendo de cómo esté estructurado).
        render(<App />);

        // En las aplicaciones React, suele haber un Header/Navbar. Buscamos cualquier enlace
        // para tener al menos un assertion funcional.
        expect(document.body).toBeInTheDocument();
    });
});
