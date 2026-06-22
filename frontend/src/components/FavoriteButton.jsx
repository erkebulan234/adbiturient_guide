import React from 'react';
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
      className="favorite-button"
      style={{
        borderColor: isFavorite ? 'var(--accent)' : 'var(--line-strong)',
        color: isFavorite ? 'var(--accent)' : 'var(--muted)',
        ...style
      }}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-pressed={isFavorite}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
}