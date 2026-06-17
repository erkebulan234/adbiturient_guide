import api from '../api/axios';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, saveProfile } from '../api/profile.api';
import { getTests, getTestById, submitTest, getTestResults } from '../api/test.api';
import { getRecommendations, generateRecommendations } from '../api/recommendations.api';
import { getPrograms } from '../api/institutions.api';

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// ─── Test ─────────────────────────────────────────────────────────────────────

export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: getTests
  });
}

export function useTestById(id) {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => getTestById(id),
    enabled: !!id
  });
}

export function useTestResults() {
  return useQuery({
    queryKey: ['testResults'],
    queryFn: getTestResults
  });
}

export function useSubmitTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, answers }) => submitTest(testId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    }
  });
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations
  });
}

export function useGenerateRecommendations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateRecommendations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    }
  });
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export function usePrograms(filters = {}) {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: () => getPrograms(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev // не показывать пустое при смене страницы
  });
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export function useFavoriteIds() {
  return useQuery({
    queryKey: ['favorites', 'ids'],
    queryFn: async () => {
      const res = await api.get('/api/favorites/ids');
      return res.data; // массив program_id
    }
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/api/favorites');
      return res.data;
    }
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ programId, isFavorite }) => {
      if (isFavorite) {
        await api.delete(`/api/favorites/${programId}`);
      } else {
        await api.post(`/api/favorites/${programId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });
}
