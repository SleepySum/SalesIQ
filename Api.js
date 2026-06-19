import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('salesiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle auth errors globally ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and reload
      localStorage.removeItem('salesiq_token');
      localStorage.removeItem('salesiq_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// ── Reports API ───────────────────────────────────────────────────────────────
export const reportsAPI = {
  submitDaily: (data) => api.post('/reports/daily', data),
  getYearly: (year) => api.get(`/reports/yearly/${year}`),
  getLatest: () => api.get('/reports/latest'),
  getByDate: (date) => api.get(`/reports/date/${date}`),
};

export default api;