import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('CartContext', () => {
    const TestComponent = () => {
        const { cartItems, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
        return (
            <div>
                <span data-testid="cart-count">{cartItems.length}</span>
                <span data-testid="total-items">{totalItems}</span>
                <span data-testid="total-price">{totalPrice.toFixed(2)}</span>
                <button data-testid="add-btn" onClick={() => addToCart({ id: 1, nombre: 'Test Product', precio: 10.50, material: 'PLA' })}>Add</button>
                <button data-testid="remove-btn" onClick={() => removeFromCart(1)}>Remove</button>
                <button data-testid="update-btn" onClick={() => updateQuantity(1, 5)}>Update</button>
                <button data-testid="clear-btn" onClick={() => clearCart()}>Clear</button>
            </div>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('starts with empty cart', () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            </MemoryRouter>
        );
        expect(screen.getByTestId('cart-count').textContent).toBe('0');
        expect(screen.getByTestId('total-items').textContent).toBe('0');
        expect(screen.getByTestId('total-price').textContent).toBe('0.00');
    });

    it('adds item to cart', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByTestId('add-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('cart-count').textContent).toBe('1');
            expect(screen.getByTestId('total-items').textContent).toBe('1');
            expect(screen.getByTestId('total-price').textContent).toBe('10.50');
        });
    });

    it('adds same item increases quantity', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            </MemoryRouter>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });
        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });

        expect(screen.getByTestId('cart-count').textContent).toBe('1');
        expect(screen.getByTestId('total-items').textContent).toBe('2');
        expect(screen.getByTestId('total-price').textContent).toBe('21.00');
    });

    it('removes item from cart', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            </MemoryRouter>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });
        await act(async () => {
            fireEvent.click(screen.getByTestId('remove-btn'));
        });

        expect(screen.getByTestId('cart-count').textContent).toBe('0');
        expect(screen.getByTestId('total-items').textContent).toBe('0');
    });

    it('updates item quantity', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            </MemoryRouter>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });
        await act(async () => {
            fireEvent.click(screen.getByTestId('update-btn'));
        });

        expect(screen.getByTestId('total-items').textContent).toBe('5');
        expect(screen.getByTestId('total-price').textContent).toBe('52.50');
    });

    it('clears entire cart', async () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <TestComponent />
                </CartProvider>
            </MemoryRouter>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });
        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('clear-btn'));
        });

        expect(screen.getByTestId('cart-count').textContent).toBe('0');
        expect(screen.getByTestId('total-items').textContent).toBe('0');
        expect(screen.getByTestId('total-price').textContent).toBe('0.00');
    });
});

describe('CartDrawer Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('does not render when cart is closed', () => {
        render(
            <MemoryRouter>
                <CartProvider>
                    <CartDrawer />
                </CartProvider>
            </MemoryRouter>
        );
        expect(screen.queryByText(/tu carrito/i)).not.toBeInTheDocument();
    });

    it('renders when cart has items', async () => {
        const CartWithItem = () => {
            const { addToCart, setIsCartOpen } = useCart();
            return (
                <button data-testid="add-btn" onClick={() => { addToCart({ id: 1, nombre: 'Test Product', precio: 25.00, material: 'PLA' }); setIsCartOpen(true); }}>
                    Add
                </button>
            );
        };

        render(
            <MemoryRouter>
                <CartProvider>
                    <CartWithItem />
                    <CartDrawer />
                </CartProvider>
            </MemoryRouter>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });

        await waitFor(() => {
            expect(screen.getByText(/tu carrito/i)).toBeInTheDocument();
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });
    });

    it('shows empty message when cart has no items', async () => {
        const CartDrawerOpen = () => {
            const { setIsCartOpen } = useCart();
            React.useEffect(() => {
                act(() => {
                    setIsCartOpen(true);
                });
            }, []);
            return <CartDrawer />;
        };

        render(
            <MemoryRouter>
                <CartProvider>
                    <CartDrawerOpen />
                </CartProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/tu carrito/i, { selector: 'h2' })).toBeInTheDocument();
        });
        expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    });

    it('checkout button is enabled when cart has items', async () => {
        const CartWithItem = () => {
            const { addToCart, setIsCartOpen } = useCart();
            return (
                <button data-testid="add-btn" onClick={() => { addToCart({ id: 1, nombre: 'Test Product', precio: 25.00, material: 'PLA' }); setIsCartOpen(true); }}>
                    Add
                </button>
            );
        };

        render(
            <MemoryRouter>
                <CartProvider>
                    <CartWithItem />
                    <CartDrawer />
                </CartProvider>
            </MemoryRouter>
        );

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-btn'));
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /tramitar pedido/i })).not.toBeDisabled();
        });
    });
});
