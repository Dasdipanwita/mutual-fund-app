import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mutual-fund-backend-oljg.onrender.com/api',
});

// Add token automatically (optional)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
