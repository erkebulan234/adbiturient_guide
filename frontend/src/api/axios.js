import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Сервер недоступен
      console.error('Сервер недоступен');
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      // Токен истёк или невалидный
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response.status === 403) {
      window.location.href = '/profile';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;