import api from './axios';

export async function getPrograms(filters = {}, signal = null) {
  const params = {};

  if (filters.educationLevel) params.educationLevel = filters.educationLevel;
  if (filters.institutionType) params.institutionType = filters.institutionType;
  if (filters.city) params.city = filters.city;

  const response = await api.get('/api/programs', { params, signal });
  return response.data;
}

export async function getInstitutions(filters = {}) {
  const response = await api.get('/api/institutions', { params: filters });
  return response.data;
}