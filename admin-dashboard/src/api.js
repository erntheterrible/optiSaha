import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return axios.post(`${API_URL}/login`, formData, {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => api.get('/dashboard-kpis'),
  getSalesTrend: () => api.get('/sales-trend'),
  getRevenueDistribution: () => api.get('/revenue-distribution'),
  getTeamPerformance: () => api.get('/team-performance'),
  getMonthlyProgress: () => api.get('/monthly-progress'),
  getVisits: (params) => api.get('/visits', { params }),
  getGpsLogs: (params) => api.get('/gps-logs', { params }),
  getRegions: () => api.get('/regions'),
  getReports: () => api.get('/reports'),
};

// Heatmap API
export const heatmapAPI = {
  getHeatmapData: (regionId) => 
    api.get(regionId ? `/api/heatmap/data?region_id=${regionId}` : '/api/heatmap/data'),
};

export default api;
