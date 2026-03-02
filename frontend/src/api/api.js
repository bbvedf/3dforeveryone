import axios from 'axios';

// Instancia de axios configurada para usar el proxy de Vite
const api = axios.create({
    baseURL: '/api'
});

// Interceptor para añadir el token en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores 401 (Token caducado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Opcional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
