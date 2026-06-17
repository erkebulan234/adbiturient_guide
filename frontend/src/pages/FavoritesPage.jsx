import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites, useToggleFavorite } from '../hooks/useApi';
import { Badge, EmptyState, SkeletonLoader } from '../components/ui';

function formatMoney(value) {
  if (!value) return null;
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

function FavoriteCard({ item, onRemove }) {
  const isCollege = item.institution_type === 'college';
  const subjects  = Array.isArray(item.required_subjects) ? item.required_subjects : [];
  const skills    = Array.isArray(item.required_skills)   ? item.required_skills   : [];
  const tags      = [...subjects, ...skills].slice(0, 7);

  return (
    <article className="program-card">
      <div className="program-card-header">
        <div>
          <div className="meta-row">
            <Badge tone="neutral">{isCollege ? 'Колледж' : 'Университет'}</Badge>
            {item.has_grant        && <Badge tone="success">Грант</Badge>}
            {item.institution_city && <Badge tone="neutral">{item.institution_city}</Badge>}
          </div>
          <h2>{item.specialty_title}</h2>
          <p>{item.profession || 'Профессия не указана'}</p>
        </div>

        <button
          className="danger-button"
          onClick={() => onRemove(item.program_id)}
          style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}
        >
          Убрать
        </button>
      </div>

      <div className="details-grid compact">
        <div><span>Учебное заведение</span><strong>{item.institution_name || '—'}</strong></div>
        <div><span>Стоимость</span><strong>{formatMoney(item.tuition_fee) || '—'}</strong></div>
        <div><span>Срок</span><strong>{item.duration_years ? `${item.duration_years} года` : '—'}</strong></div>
        <div><span>Язык</span><strong>{item.study_language || '—'}</strong></div>
        <div><span>Форма</span><strong>{item.study_form || '—'}</strong></div>
        <div><span>Мин. балл ЕНТ</span><strong>{item.min_score || '—'}</strong></div>
      </div>

      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag, i) => <span className="tag" key={`${tag}-${i}`}>{tag}</span>)}
        </div>
      )}

      {item.institution_website && (
        <div className="actions" style={{ marginTop: 16 }}>
          <a className="secondary-button" href={item.institution_website} target="_blank" rel="noreferrer">
            Сайт заведения →
          </a>
        </div>
      )}
    </article>
  );
}

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
