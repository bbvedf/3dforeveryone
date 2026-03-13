import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';
import * as AuthContext from '../context/AuthContext';

// Mockeamos de nuevo el useAuth
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('ProtectedRoute Helper', () => {

    const TestApp = () => (
        <Routes>
            <Route path="/login" element={<h1>Página de Login</h1>} />
            <Route path="/test-page" element={
                <ProtectedRoute adminOnly={false}>
                    <h1>Contenido Secreto</h1>
                </ProtectedRoute>
            } />
            <Route path="/admin-page" element={
                <ProtectedRoute adminOnly={true}>
                    <h1>Panel Táctico Admin</h1>
                </ProtectedRoute>
            } />
        </Routes>
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects anonymous users to /login', () => {
        // Simulamos un usuario NO logueado
        AuthContext.useAuth.mockReturnValue({
            user: null,
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={['/test-page']}>
                <TestApp />
            </MemoryRouter>
        );

        // Como no está logueado, debe echarlo a la /login
        expect(screen.getByText('Página de Login')).toBeInTheDocument();
        expect(screen.queryByText('Contenido Secreto')).not.toBeInTheDocument();
    });

    it('allows authenticated users to view normal protected pages', () => {
        // Simulamos un usuario logueado normal
        AuthContext.useAuth.mockReturnValue({
            user: { id: 1, email: 'user@test.com' },
            loading: false,
            isAdmin: false
        });

        render(
            <MemoryRouter initialEntries={['/test-page']}>
                <TestApp />
            </MemoryRouter>
        );

        // Debe ver el contenido secreto y NO ser redirigido a login
        expect(screen.getByText('Contenido Secreto')).toBeInTheDocument();
    });

    it('redirects normal users away from admin-only pages', () => {
        // Simulamos un usuario logueado normal (pero intenta entrar como Admin)
        AuthContext.useAuth.mockReturnValue({
            user: { id: 1 },
            loading: false,
            isAdmin: false
        });

        render(
            <MemoryRouter initialEntries={['/admin-page']}>
                <TestApp />
            </MemoryRouter>
        );

        // Como requireAdmin es true y él no lo es, se asume que hace fallback a home ('/')
        // o bloquea la carga. Según nuestro código actual redirige a "/". Al no tener ruta en el TestApp,
        // simplemente no debe verse el panel de admin
        expect(screen.queryByText('Panel Táctico Admin')).not.toBeInTheDocument();
    });
});
