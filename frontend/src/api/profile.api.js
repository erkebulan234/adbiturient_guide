import api from './axios';

export async function getProfile() {
  const response = await api.get('/api/profile');
  return response.data;
}

export async function saveProfile(data) {
  const response = await api.post('/api/profile', data);
  return response.data;
}