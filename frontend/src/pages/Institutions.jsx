import React, { useRef, useMemo, useState, useEffect } from 'react';
import { usePrograms } from '../hooks/useApi';
import Input, { Select } from '../components/Input';
import { Badge, EmptyState, SkeletonLoader } from '../components/ui';
import FavoriteButton from '../components/FavoriteButton';
import CompareButton from '../components/CompareButton';
import ProgramCard from '../components/ProgramCard';

const PAGE_SIZE = 12;



function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const windowSize = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= windowSize) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
      <button
        className="secondary-button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        style={{ opacity: page <= 1 ? 0.5 : 1 }}
      >
        ← Назад
      </button>

      {pages.map((p, i) => p === '…' ? (
        <span key={`dots-${i}`} style={{ padding: '8px 4px', color: '#94a3b8' }}>…</span>
      ) : (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={p === page ? 'primary-button' : 'secondary-button'}
          style={{ minWidth: 40 }}
        >
          {p}
        </button>
      ))}

      <button
        className="secondary-button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        style={{ opacity: page >= totalPages ? 0.5 : 1 }}
      >
        Вперёд →
      </button>
    </nav>
  );
}

export default function Institutions() {
  const [filters, setFilters] = useState({
    educationLevel:  '',
    institutionType: '',
    city:            '',
    search:          '',
  });

  const [apiFilters, setApiFilters] = useState({ ...filters, page: 1, limit: PAGE_SIZE });
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  const { data, isLoading, isFetching } = usePrograms(apiFilters);
  const programs    = data?.items || [];
  const pagination  = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  function applyFilters(next, resetPage = true) {
    setFilters(next);
    const nextPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setApiFilters({ ...next, page: nextPage, limit: PAGE_SIZE });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const next = { ...filters, [name]: value };

    if (name === 'city' || name === 'search') {
      setFilters(next);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applyFilters(next), 400);
    } else {
      applyFilters(next);
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    setApiFilters({ ...filters, page: newPage, limit: PAGE_SIZE });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  const summary = useMemo(() => ({
    total: pagination.total,
    cities: data?.stats?.cities ?? 0,
    grants: data?.stats?.grants ?? 0
  }), [data, pagination.total]);

  return (
    <main className="page">
      <section className="results-header">
        <div>
          <p className="kicker">Каталог программ</p>
          <h1>Колледжи и университеты в понятном формате</h1>
          <p className="lead">
            Фильтруйте программы по уровню, типу учебного заведения и городу,
            затем сравнивайте условия без перегруженных таблиц.
          </p>
        </div>
      </section>

      <section className="compact-stats">
        <div><strong>{summary.total}</strong><span>программ всего</span></div>
        <div><strong>{summary.cities}</strong><span>городов на странице</span></div>
        <div><strong>{summary.grants}</strong><span>с грантом на странице</span></div>
      </section>

      <section className="filters-strip" style={{ gridTemplateColumns: '1fr' }}>
        <Input
          label="Поиск" name="search" value={filters.search} onChange={handleChange}
          placeholder="Название специальности или заведения"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Select label="Уровень" name="educationLevel" value={filters.educationLevel} onChange={handleChange}>
            <option value="">Все</option>
            <option value="grade_9">После 9 класса</option>
            <option value="grade_11">После 11 класса</option>
          </Select>
          <Select label="Тип" name="institutionType" value={filters.institutionType} onChange={handleChange}>
            <option value="">Все</option>
            <option value="college">Колледж</option>
            <option value="university">Университет</option>
          </Select>
          <Input label="Город" name="city" value={filters.city} onChange={handleChange} placeholder="Например: Алматы" />
        </div>
      </section>

      {isLoading && <SkeletonLoader rows={3} />}

      {!isLoading && programs.length === 0 && (
        <EmptyState
          title="Программы не найдены"
          description="Попробуйте изменить город, поисковый запрос, уровень обучения или тип учебного заведения."
        />
      )}
      
      {!isLoading && programs.length > 0 && (
        <>
          <section className="catalog-list" style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {programs.map(program => <ProgramCard program={program} key={program.id} />)}
          </section>
      
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={handlePageChange}
          />
      
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#94a3b8' }}>
            Страница {pagination.page} из {pagination.totalPages} · {pagination.total} программ всего
          </p>
        </>
      )}
    </main>
  );
}