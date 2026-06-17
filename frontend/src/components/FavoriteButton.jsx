import React from 'react';
import api from '../api/axios';
import { useFavoriteIds, useToggleFavorite } from '../hooks/useApi';

export default function FavoriteButton({ programId, style = {} }) {
  const { data: ids = [] } = useFavoriteIds();
  const toggle = useToggleFavorite();

  const isFavorite = ids.includes(programId);

  function handleClick(e) {
    e.preventDefault();
    toggle.mutate({ programId, isFavorite });
  }


  return (
    <button
      onClick={handleClick}
      disabled={toggle.isPending}
      title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      style={{
        background: 'none',
        border: `2px solid ${isFavorite ? '#f59e0b' : '#e5e7eb'}`,
        borderRadius: 10,
        cursor: 'pointer',
        padding: '6px 10px',
        fontSize: 18,
        lineHeight: 1,
        color: isFavorite ? '#f59e0b' : '#9ca3af',
        transition: 'all 0.15s',
        ...style
      }}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
}
