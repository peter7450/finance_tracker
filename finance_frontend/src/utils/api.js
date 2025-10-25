import axios from 'axios'

const API_URL = '/api';

const api = axios.create({
    baseURL : 'API_URL',
    headers : {
        "Content-Type": 'application/json',
    },
});

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


            }
        }
    }
);