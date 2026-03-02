import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminProducts from './pages/admin/AdminProducts';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
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
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/categorias" element={<div className="container" style={{ padding: '40px' }}><h2>Categorías Premium</h2><p>Listado próximamente...</p></div>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminProducts />
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
      </ThemeProvider>
    </Router>
  );
};

export default App;
