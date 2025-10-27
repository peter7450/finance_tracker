    import axios from 'axios';

    // Base URL for API (proxy handles this in development)
    const API_URL = 'http://localhost:8000/api';
    // Create axios instance
    const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
    });

    // Add token to requests automatically
    api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    );

    // Handle token refresh on 401 errors
    api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
            });

            const { access } = response.data;
            localStorage.setItem('access_token', access);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
        }

        return Promise.reject(error);
    }
    );

    // Auth API calls
    export const authAPI = {
    login: async (username, password) => {
        const response = await axios.post(`${API_URL}/token/`, {
        username,
        password,
        });
        return response.data;
    },

    register: async (username, email, password) => {
        // Note: You'll need to create a register endpoint in Django
        const response = await axios.post(`${API_URL}/register/`, {
        username,
        email,
        password,
        });
        return response.data;
    },
    };

    // Transaction API calls
    export const transactionAPI = {
    getAll: () => api.get('/transactions/'),
    getById: (id) => api.get(`/transactions/${id}/`),
    create: (data) => api.post('/transactions/', data),
    update: (id, data) => api.put(`/transactions/${id}/`, data),
    delete: (id) => api.delete(`/transactions/${id}/`),
    getSummary: () => api.get('/transactions/summary/'),
    getByCategory: (categoryId) => api.get(`/transactions/by_category/?category_id=${categoryId}`),
    };

    // Category API calls
    export const categoryAPI = {
    getAll: () => api.get('/categories/'),
    getById: (id) => api.get(`/categories/${id}/`),
    create: (data) => api.post('/categories/', data),
    update: (id, data) => api.put(`/categories/${id}/`, data),
    delete: (id) => api.delete(`/categories/${id}/`),
    };

    // Budget API calls
    export const budgetAPI = {
    getAll: () => api.get('/budgets/'),
    getById: (id) => api.get(`/budgets/${id}/`),
    create: (data) => api.post('/budgets/', data),
    update: (id, data) => api.put(`/budgets/${id}/`, data),
    delete: (id) => api.delete(`/budgets/${id}/`),
    getCurrentMonth: () => api.get('/budgets/current_month/'),
    };

    export default api;
