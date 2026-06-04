import api from './axios';

export async function getTests() {
  const response = await api.get('/api/test');
  return response.data;
}

export async function getTestById(id) {
  const response = await api.get(`/api/test/${id}`);
  return response.data;
}

export async function submitTest(id, answers) {
  const response = await api.post(`/api/test/${id}/submit`, { answers });
  return response.data;
}

export async function getTestResults() {
  const response = await api.get('/api/test/results');
  return response.data;
}