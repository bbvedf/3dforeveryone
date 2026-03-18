import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Register from '../pages/Register';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../api/api', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Form Validation', () => {
        it('renders form with all required fields', () => {
            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            expect(screen.getByText(/Únete a/)).toBeInTheDocument();
            expect(screen.getByText('3D4E')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /crear mi cuenta/i })).toBeInTheDocument();
        });

        it('shows error for invalid email format', async () => {
            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
                target: { value: 'invalid-email' },
            });

            const passwordInputs = document.querySelectorAll('input[type="password"]');
            fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

            const nombreInput = document.querySelector('input[name="nombre"]');
            fireEvent.change(nombreInput, { target: { value: 'Juan' } });

            fireEvent.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

            await waitFor(() => {
                expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
            });
        });

        it('shows error when passwords do not match', async () => {
            const api = await import('../api/api');
            api.default.post.mockResolvedValue({ data: {} });

            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
                target: { value: 'test@example.com' },
            });

            const passwordInputs = document.querySelectorAll('input[type="password"]');
            fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'differentpass' } });

            fireEvent.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

            await waitFor(() => {
                expect(screen.getByText(/contraseñas no coinciden/i)).toBeInTheDocument();
            });

            expect(api.default.post).not.toHaveBeenCalled();
        });

        it('shows error when password is too short', async () => {
            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
                target: { value: 'test@example.com' },
            });

            const passwordInputs = document.querySelectorAll('input[type="password"]');
            fireEvent.change(passwordInputs[0], { target: { value: '123' } });
            fireEvent.change(passwordInputs[1], { target: { value: '123' } });

            fireEvent.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

            await waitFor(() => {
                expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument();
            });
        });

        it('shows error when name is too short', async () => {
            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
                target: { value: 'test@example.com' },
            });

            const passwordInputs = document.querySelectorAll('input[type="password"]');
            fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

            const nombreInput = document.querySelector('input[name="nombre"]');
            fireEvent.change(nombreInput, { target: { value: 'J' } });

            fireEvent.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

            await waitFor(() => {
                expect(screen.getByText(/nombre válido/i)).toBeInTheDocument();
            });
        });

        it('does not submit form when required fields are empty', async () => {
            const api = await import('../api/api');
            api.default.post.mockResolvedValue({ data: {} });

            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

            await waitFor(() => {
                expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
            });

            expect(api.default.post).not.toHaveBeenCalled();
        });
    });

    describe('Successful Registration', () => {
        it('submits form with valid data and shows success modal', async () => {
            const api = await import('../api/api');
            api.default.post.mockResolvedValue({ data: { success: true } });

            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
                target: { value: 'test@example.com' },
            });

            const passwordInputs = document.querySelectorAll('input[type="password"]');
            fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
            fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

            const nombreInput = document.querySelector('input[name="nombre"]');
            fireEvent.change(nombreInput, { target: { value: 'Juan' } });

            fireEvent.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

            await waitFor(() => {
                expect(api.default.post).toHaveBeenCalledWith('/clientes/registro', expect.objectContaining({
                    email: 'test@example.com',
                    contraseña: 'password123',
                    nombre: 'Juan',
                }));
            });

            await waitFor(() => {
                expect(screen.getByText('¡Cuenta Creada!')).toBeInTheDocument();
            });
        });
    });
});
