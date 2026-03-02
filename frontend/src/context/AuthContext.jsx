import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restaurar sesión al cargar la página
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Obtenemos los datos del usuario (puedes añadir un endpoint /me en el backend para esto en el futuro)
            // Por ahora, como sabemos el email, pediremos el cliente por email o usaremos la respuesta decodificada del token
            // Para este MVP, simularemos la carga del perfil
            const profileResponse = await api.get('/clientes/');
            const currentUser = profileResponse.data.find(c => c.email === email);

            if (currentUser) {
                localStorage.setItem('user', JSON.stringify(currentUser));
                setUser(currentUser);
            }
            return { success: true };
        } catch (error) {
            console.error('Error login:', error);
            return { success: false, error: error.response?.data?.detail || 'Error en el login' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const isAdmin = user?.rol === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
