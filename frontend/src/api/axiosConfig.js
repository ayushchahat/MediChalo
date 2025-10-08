import axios from 'axios';

// Directly use the Render backend URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your deployed backend
});

// Interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
