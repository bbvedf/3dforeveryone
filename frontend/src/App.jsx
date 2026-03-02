import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/categorias" element={<div className="container" style={{ padding: '40px' }}><h2>Categorías Premium</h2><p>Listado próximamente...</p></div>} />
              <Route path="/admin" element={<div className="container" style={{ padding: '40px' }}><h2>Panel de Control Admin</h2><p>Aquí gestionarás el inventario y los pedidos.</p></div>} />
            </Routes>
          </main>
          <footer style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            &copy; 2024 3D4EVERYONE - Fabricación Aditiva de Alta Precisión
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
