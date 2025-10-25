import axios from 'axios'

const API_URL = '/api';

const api = axios.create({
    baseURL : 'API_URL',
    headers : {
        "Content-Type": 'application/json',
    },
});

// a request interceptor more like that

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
    if(token){
        config.headers.Authorization = 'Bearer ${token}';
    }
    return config
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handles users request => (401 erroes) 

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response =  await axios.post('${API_URL}/token/refresh', {
                    refresh: refreshToken,
                });
                const { access } = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = 'Bearer ${access}';
                return api(originalRequest);
            } catch (refreshError){
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }

            }
            return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (username, password) => {
        const reponse = await axios.post('${API_URL}/token/',{
            username,
            password,
        });
        return  reponse.data;
    },
    register: async(username,email,password) => {

        const response = await axios.post('${API_URL}/register/',{
            username,
            email,
            password,
        });
        return reponse.data;
    },
};

export const transactionsAPI = {
    getAll: () => api.get('/transactions/'),
    getById: (id) => api.get('/transactions/${id}/'),
    create: (data) => api.post('/transactions/', data),
    update: (id, data) => api.put('/transactions/${id}/', data),
    delete: (id) =>  api.delete('/transactions/${id}'),
    getSummary: () => api.get('transactions/summary'),
    getByCategory: (categoryId) => api.get('/transactions/by_category/?category_id=${category_id}'),
};
