import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from './Login';
import * as AuthContext from '../context/AuthContext';

// 1. Mockeamos el módulo de AuthContext para controlar sus retornos
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// 2. Mockeamos useNavigate de react-router-dom para saber si nos redirige
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        // Reseteamos los mocks antes de cada test
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        // Simulamos que el hook useAuth devuelve una funcion dummy
        AuthContext.useAuth.mockReturnValue({
            login: vi.fn(),
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByText('Inicia Sesión')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('admin@3dforeveryone.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
    });

    it('displays error message on failed login', async () => {
        // Simulamos un login fallido
        const mockLoginFallo = vi.fn().mockResolvedValue({
            success: false,
            error: 'Credenciales inválidas',
        });
        AuthContext.useAuth.mockReturnValue({ login: mockLoginFallo });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Rellenamos el formulario
        fireEvent.change(screen.getByPlaceholderText('admin@3dforeveryone.com'), {
            target: { value: 'error@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'wrongpass' },
        });

        // Enviamos
        fireEvent.click(screen.getByRole('button', { name: /acceder/i }));

        // Esperamos a que el estado se actualice con el error
        await waitFor(() => {
            expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
        });

        // Verificamos que NO ha redirigido
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to home on successful login', async () => {
        // Simulamos un login exitoso
        const mockLoginExito = vi.fn().mockResolvedValue({
            success: true,
        });
        AuthContext.useAuth.mockReturnValue({ login: mockLoginExito });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Rellenamos formulario
        fireEvent.change(screen.getByPlaceholderText('admin@3dforeveryone.com'), {
            target: { value: 'admin@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'Secret123!' },
        });

        // Enviamos
        fireEvent.click(screen.getByRole('button', { name: /acceder/i }));

        // Aseguramos de que el login fue llamado con los credenciales correctos
        await waitFor(() => {
            expect(mockLoginExito).toHaveBeenCalledWith('admin@test.com', 'Secret123!');
        });

        // Verificamos que navigate('/') fue disparado
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
