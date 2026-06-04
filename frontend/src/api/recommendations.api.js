import api from './axios';

export async function getRecommendations() {
  const response = await api.get('/api/recommendations');
  return response.data;
}

export async function generateRecommendations() {
  const response = await api.post('/api/recommendations/generate', {});
  return response.data;
}