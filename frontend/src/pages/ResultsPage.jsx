import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const sortOptions = [
  { value: 'match', label: 'Лучшее совпадение' },
  { value: 'tuition', label: 'Ниже стоимость' },
  { value: 'grant', label: 'Сначала с грантом' }
];

function getPercent(item) {
  const value = item.match_percent ?? item.matchPercent ?? item.score ?? 0;
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function formatMoney(value) {
  if (!value) return 'Не указано';
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function MatchScore({ value }) {
  return (
    <div className="match-score">
      <strong>{value}%</strong>
      <span>совпадение</span>
    </div>
  );
}

function EmptyState({ onAction, isLoading }) {
  return (
    <section className="empty-state panel">
      <p className="kicker">Рекомендации</p>
      <h2>Пока нет персонального подбора</h2>
      <p>
        Заполните анкету и пройдите тест, чтобы система сопоставила ваши интересы с программами обучения.
      </p>
      <div className="actions">
        <button className="primary-button" type="button" onClick={onAction} disabled={isLoading}>
          {isLoading ? 'Формируем...' : 'Сформировать рекомендации'}
        </button>
        <Link className="secondary-button" to="/test">Пройти тест</Link>
      </div>
    </section>
  );
}

function RecommendationCard({ item, index }) {
  const percent = getPercent(item);
  const subjects = normalizeArray(item.required_subjects);
  const skills = normalizeArray(item.required_skills);

  return (
    <article className="recommendation-row" style={{ '--delay': `${index * 55}ms` }}>
      <div className="recommendation-main">
        <div className="recommendation-title">
          <div>
            <div className="meta-row">
              <span>{item.institution_type === 'college' ? 'Колледж' : 'Университет'}</span>
              {item.has_grant && <span>Есть грант</span>}
              {item.institution_city && <span>{item.institution_city}</span>}
            </div>

            <h2>{item.title || item.specialty_title || 'Образовательная программа'}</h2>
            <p>{item.description || 'Программа соответствует вашему профилю и результатам теста.'}</p>
          </div>

          <MatchScore value={percent} />
        </div>

        <div className="match-bar">
          <span style={{ width: `${percent}%` }} />
        </div>

        <div className="details-grid">
          <div>
            <span>Профессия</span>
            <strong>{item.profession || 'Не указано'}</strong>
          </div>
          <div>
            <span>Учебное заведение</span>
            <strong>{item.institution_name || 'Не указано'}</strong>
          </div>
          <div>
            <span>Стоимость</span>
            <strong>{formatMoney(item.tuition_fee)}</strong>
          </div>
          <div>
            <span>Срок</span>
            <strong>{item.duration_years ? `${item.duration_years} года` : 'Не указано'}</strong>
          </div>
          <div>
            <span>Язык</span>
            <strong>{item.study_language || 'Не указано'}</strong>
          </div>
          <div>
            <span>Минимальный балл</span>
            <strong>{item.min_score || 'Не указано'}</strong>
          </div>
        </div>

        {(subjects.length > 0 || skills.length > 0) && (
          <div className="tag-row">
            {[...subjects, ...skills].slice(0, 8).map(tag => (
              <span className="tag" key={tag}>{tag}</span>
            ))}
          </div>
        )}

        <div className="reason-box">
          <span>Логика рекомендации</span>
          <p>{item.reason || 'Система нашла пересечение между вашими предметами, навыками, интересами и требованиями программы.'}</p>
        </div>
      </div>
    </article>
  );
}

export default function ResultsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('Загружаем рекомендации...');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    grant: 'all',
    sort: 'match'
  });

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setIsLoading(true);

    try {
      const response = await api.get('/api/recommendations');
      setRecommendations(Array.isArray(response.data) ? response.data : []);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Не удалось загрузить рекомендации');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateRecommendations() {
    setIsGenerating(true);
    setMessage('Формируем персональный подбор...');

    try {
      await api.post('/api/recommendations/generate', {});
      await loadRecommendations();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Не удалось сформировать рекомендации');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleFilterChange(event) {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  }

  const filteredRecommendations = useMemo(() => {
    const next = recommendations.filter(item => {
      const typeMatches = filters.type === 'all' || item.institution_type === filters.type;
      const grantMatches = filters.grant === 'all' || String(Boolean(item.has_grant)) === filters.grant;
      return typeMatches && grantMatches;
    });

    return [...next].sort((a, b) => {
      if (filters.sort === 'tuition') {
        return Number(a.tuition_fee || Infinity) - Number(b.tuition_fee || Infinity);
      }

      if (filters.sort === 'grant') {
        return Number(Boolean(b.has_grant)) - Number(Boolean(a.has_grant));
      }

      return getPercent(b) - getPercent(a);
    });
  }, [recommendations, filters]);

  const bestMatch = recommendations.reduce((max, item) => Math.max(max, getPercent(item)), 0);
  const grantCount = recommendations.filter(item => item.has_grant).length;

  return (
    <main className="page">
      <section className="results-header">
        <div>
          <p className="kicker">Интеллектуальный подбор</p>
          <h1>Рекомендации, которые можно сравнивать спокойно</h1>
          <p className="lead">
            Не просто список специальностей, а объяснимый подбор: совпадение, требования, стоимость, гранты и причина рекомендации.
          </p>
        </div>

        <div className="results-actions">
          <button className="primary-button" type="button" onClick={generateRecommendations} disabled={isGenerating}>
            {isGenerating ? 'Обновляем...' : 'Обновить подбор'}
          </button>
          <Link className="secondary-button" to="/profile">Уточнить анкету</Link>
        </div>
      </section>

      <section className="compact-stats">
        <div><strong>{recommendations.length}</strong><span>программ найдено</span></div>
        <div><strong>{bestMatch}%</strong><span>лучшее совпадение</span></div>
        <div><strong>{grantCount}</strong><span>вариантов с грантом</span></div>
      </section>

      {message && <div className={`notice ${message.includes('Не удалось') ? 'error' : ''}`}>{message}</div>}

      {isLoading && (
        <section className="recommendations-list">
          {[1, 2, 3].map(item => <div className="skeleton-row" key={item} />)}
        </section>
      )}

      {!isLoading && recommendations.length === 0 && (
        <EmptyState onAction={generateRecommendations} isLoading={isGenerating} />
      )}

      {!isLoading && recommendations.length > 0 && (
        <>
          <section className="filters-strip">
            <label>
              Тип
              <select className="select" name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="all">Все</option>
                <option value="college">Колледжи</option>
                <option value="university">Университеты</option>
              </select>
            </label>

            <label>
              Грант
              <select className="select" name="grant" value={filters.grant} onChange={handleFilterChange}>
                <option value="all">Все</option>
                <option value="true">Есть грант</option>
                <option value="false">Без гранта</option>
              </select>
            </label>

            <label>
              Сортировка
              <select className="select" name="sort" value={filters.sort} onChange={handleFilterChange}>
                {sortOptions.map(option => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </section>

          <section className="recommendations-list">
            {filteredRecommendations.map((item, index) => (
              <RecommendationCard item={item} index={index} key={item.id || `${item.title}-${index}`} />
            ))}
          </section>

          {filteredRecommendations.length === 0 && (
            <section className="empty-state panel">
              <h2>По этим фильтрам ничего не найдено</h2>
              <p>Попробуйте выбрать другой тип учреждения или убрать фильтр по гранту.</p>
            </section>
          )}
        </>
      )}
    </main>
  );
}