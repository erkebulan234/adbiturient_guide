import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true  // отправляет httpOnly cookie с каждым запросом
});

// Храним токен в памяти (не в localStorage)
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Подставляем access token в каждый запрос
api.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Если получили 401 — пробуем обновить токен и повторить запрос
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const res = await api.post('/auth/refresh');
        accessToken = res.data.token;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        accessToken = null;
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;