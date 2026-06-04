import React, { useEffect, useRef, useMemo, useState } from 'react';
import { getPrograms } from '../api/institutions.api';
import Input, { Select } from '../components/Input';
import { Badge, EmptyState, SkeletonLoader } from '../components/ui';

function formatMoney(value) {
  if (!value) return null;
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

function ProgramCard({ program }) {
  const subjects = Array.isArray(program.required_subjects) ? program.required_subjects : [];
  const skills   = Array.isArray(program.required_skills)   ? program.required_skills   : [];
  const tags     = [...subjects, ...skills].slice(0, 7);
  const isCollege = program.institution_type === 'college';

  return (
    <article className="program-card">
      <div className="program-card-header">
        <div>
          <div className="meta-row">
            <Badge tone="neutral">{isCollege ? 'Колледж' : 'Университет'}</Badge>
            {program.has_grant        && <Badge tone="success">Грант</Badge>}
            {program.institution_city && <Badge tone="neutral">{program.institution_city}</Badge>}
          </div>
          <h2>{program.specialty_title}</h2>
          <p>{program.profession || 'Профессия не указана'}</p>
        </div>
      </div>

      <div className="details-grid compact">
        <div>
          <span>Учебное заведение</span>
          <strong>{program.institution_name || '—'}</strong>
        </div>
        <div>
          <span>Стоимость</span>
          <strong>{formatMoney(program.tuition_fee) || '—'}</strong>
        </div>
        <div>
          <span>Срок</span>
          <strong>{program.duration_years ? `${program.duration_years} года` : '—'}</strong>
        </div>
        <div>
          <span>Язык</span>
          <strong>{program.study_language || '—'}</strong>
        </div>
        <div>
          <span>Форма</span>
          <strong>{program.study_form || '—'}</strong>
        </div>
        <div>
          <span>Мин. балл ЕНТ</span>
          <strong>{program.min_score || '—'}</strong>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="tag-row">
          {[...subjects, ...skills].slice(0, 7).map((tag, index) => (
            <span className="tag" key={`${tag}-${index}`}>{tag}</span>
          ))}
        </div>
      )}

      {program.institution_website && (
        <div className="actions" style={{ marginTop: 16 }}>
          <a
            className="secondary-button"
            href={program.institution_website}
            target="_blank"
            rel="noreferrer"
          >
            Сайт заведения →
          </a>
        </div>
      )}
    </article>
  );
}

export default function Institutions() {
  const [programs,  setPrograms]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters,   setFilters]   = useState({
    educationLevel: '',
    institutionType: '',
    city: '',
    search: '',
  });

  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  async function loadPrograms(currentFilters) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    try {
      const data = await getPrograms(currentFilters, abortRef.current.signal);
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'CanceledError') console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms(filters);
    return () => abortRef.current?.abort();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    const next = { ...filters, [name]: value };
    setFilters(next);

    if (name === 'city' || name === 'search') {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => loadPrograms(next), 400);
    } else {
      loadPrograms(next);
    }
  }

  const filtered = useMemo(() => {
    if (!filters.search.trim()) return programs;
    const q = filters.search.toLowerCase().trim();
    return programs.filter(p =>
      p.specialty_title?.toLowerCase().includes(q) ||
      p.institution_name?.toLowerCase().includes(q) ||
      p.profession?.toLowerCase().includes(q)
    );
  }, [programs, filters.search]);

  const summary = useMemo(() => {
    const cities = new Set(filtered.map(p => p.institution_city).filter(Boolean));
    return {
      total:  filtered.length,
      cities: cities.size,
      grants: filtered.filter(p => p.has_grant).length,
    };
  }, [filtered]);



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
        <div><strong>{summary.total}</strong><span>программ</span></div>
        <div><strong>{summary.cities}</strong><span>городов</span></div>
        <div><strong>{summary.grants}</strong><span>с грантом</span></div>
      </section>

      <section className="filters-strip" style={{gridTemplateColumns: '1fr'}}>
        <Input
          label="Поиск"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Название специальности или заведения"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} >
        <Select
          label="Уровень"
          name="educationLevel"
          value={filters.educationLevel}
          onChange={handleChange}
        >
          <option value="">Все</option>
          <option value="grade_9">После 9 класса</option>
          <option value="grade_11">После 11 класса</option>
        </Select>

        <Select
          label="Тип"
          name="institutionType"
          value={filters.institutionType}
          onChange={handleChange}
        >
          <option value="">Все</option>
          <option value="college">Колледж</option>
          <option value="university">Университет</option>
        </Select>

        <Input
          label="Город"
          name="city"
          value={filters.city}
          onChange={handleChange}
          placeholder="Например: Алматы"
        />
        </div>
      </section>

      {isLoading && <SkeletonLoader rows={3} />}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title="Программы не найдены"
          description="Попробуйте изменить город, уровень обучения или тип учебного заведения."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <section className="catalog-list">
          {filtered.map(program => (
            <ProgramCard program={program} key={program.id} />
          ))}
        </section>
      )}
    </main>
  );
}