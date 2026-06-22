import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites, useToggleFavorite } from '../hooks/useApi';
import { Badge, EmptyState, SkeletonLoader } from '../components/ui';
import FavoriteCard from '../components/FavoriteCard';

export default function FavoritesPage() {
  const { data: favorites = [], isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  function handleRemove(programId) {
    toggleFavorite.mutate({ programId, isFavorite: true });
  }

  return (
    <main className="page">
      <section className="results-header">
        <div>
          <p className="kicker">Избранное</p>
          <h1>Сохранённые программы</h1>
          <p className="lead">
            Программы которые вы отметили для детального сравнения.
          </p>
        </div>
        <div className="results-actions">
          <Link className="secondary-button" to="/institutions">Каталог программ</Link>
          <Link className="secondary-button" to="/results">Рекомендации</Link>
        </div>
      </section>

      {isLoading && <SkeletonLoader rows={3} />}

      {!isLoading && favorites.length === 0 && (
        <EmptyState
          eyebrow="Избранное"
          title="Пока ничего не сохранено"
          description="Нажмите на звёздочку на карточке программы чтобы сохранить её сюда."
          action={
            <div className="actions">
              <Link className="primary-button" to="/institutions">Открыть каталог</Link>
              <Link className="secondary-button" to="/results">Смотреть рекомендации</Link>
            </div>
          }
        />
      )}

      {!isLoading && favorites.length > 0 && (
        <section className="catalog-list">
          {favorites.map(item => (
            <FavoriteCard
              key={item.favorite_id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </section>
      )}
    </main>
  );
}
