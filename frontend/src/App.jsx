import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminClients from './pages/admin/AdminClients';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--background)',
              color: 'var(--text-main)',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}>
              <Navbar />
              <CartDrawer />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Catalog />} />
                  <Route path="/producto/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                  <Route path="/categorias" element={<Categories />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categorias"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminCategories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pedidos"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/clientes"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminClients />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mis-pedidos"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <footer style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--card-border)',
                fontSize: '14px'
              }}>
                &copy; 2024 3D4EVERYONE - Fabricación Aditiva de Alta Precisión
              </footer>
            </div>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
