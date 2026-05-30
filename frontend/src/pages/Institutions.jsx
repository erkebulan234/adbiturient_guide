import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

function formatMoney(value) {
  if (!value) return 'Не указано';
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

function ProgramCard({ program }) {
  const subjects = Array.isArray(program.required_subjects) ? program.required_subjects : [];
  const skills = Array.isArray(program.required_skills) ? program.required_skills : [];

  return (
    <article className="program-card">
      <div className="program-card-header">
        <div>
          <div className="meta-row">
            <span>{program.institution_type === 'college' ? 'Колледж' : 'Университет'}</span>
            {program.has_grant && <span>Есть грант</span>}
            {program.institution_city && <span>{program.institution_city}</span>}
          </div>
          <h2>{program.specialty_title}</h2>
          <p>{program.profession || 'Профессия не указана'}</p>
        </div>
      </div>

      <div className="details-grid compact">
        <div><span>Учебное заведение</span><strong>{program.institution_name || 'Не указано'}</strong></div>
        <div><span>Стоимость</span><strong>{formatMoney(program.tuition_fee)}</strong></div>
        <div><span>Срок</span><strong>{program.duration_years ? `${program.duration_years} года` : 'Не указано'}</strong></div>
        <div><span>Язык</span><strong>{program.study_language || 'Не указано'}</strong></div>
        <div><span>Форма</span><strong>{program.study_form || 'Не указано'}</strong></div>
        <div><span>Минимальный балл</span><strong>{program.min_score || 'Не указано'}</strong></div>
      </div>

      {(subjects.length > 0 || skills.length > 0) && (
        <div className="tag-row">
          {[...subjects, ...skills].slice(0, 7).map(tag => (
            <span className="tag" key={tag}>{tag}</span>
          ))}
        </div>
      )}

      {program.institution_website && (
        <a className="text-link" href={program.institution_website} target="_blank" rel="noreferrer">
          Открыть сайт учебного заведения
        </a>
      )}
    </article>
  );
}

export default function Institutions() {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    educationLevel: '',
    institutionType: '',
    city: ''
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms(customFilters = filters) {
    setIsLoading(true);

    try {
      const params = {};

      if (customFilters.educationLevel) params.educationLevel = customFilters.educationLevel;
      if (customFilters.institutionType) params.institutionType = customFilters.institutionType;
      if (customFilters.city) params.city = customFilters.city;

      const response = await api.get('/api/programs', { params });
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const nextFilters = {
      ...filters,
      [event.target.name]: event.target.value
    };

    setFilters(nextFilters);
    loadPrograms(nextFilters);
  }

  const summary = useMemo(() => {
    const cities = new Set(programs.map(program => program.institution_city).filter(Boolean));
    const grants = programs.filter(program => program.has_grant).length;

    return {
      total: programs.length,
      cities: cities.size,
      grants
    };
  }, [programs]);

  return (
    <main className="page">
      <section className="results-header">
        <div>
          <p className="kicker">Каталог программ</p>
          <h1>Колледжи и университеты в понятном формате</h1>
          <p className="lead">
            Фильтруйте программы по уровню, типу учебного заведения и городу, затем сравнивайте условия без перегруженных таблиц.
          </p>
        </div>
      </section>

      <section className="compact-stats">
        <div><strong>{summary.total}</strong><span>программ</span></div>
        <div><strong>{summary.cities}</strong><span>городов</span></div>
        <div><strong>{summary.grants}</strong><span>с грантом</span></div>
      </section>

      <section className="filters-strip">
        <label>
          Уровень
          <select className="select" name="educationLevel" value={filters.educationLevel} onChange={handleChange}>
            <option value="">Все</option>
            <option value="grade_9">После 9 класса</option>
            <option value="grade_11">После 11 класса</option>
          </select>
        </label>

        <label>
          Тип
          <select className="select" name="institutionType" value={filters.institutionType} onChange={handleChange}>
            <option value="">Все</option>
            <option value="college">Колледж</option>
            <option value="university">Университет</option>
          </select>
        </label>

        <label>
          Город
          <input className="input" name="city" value={filters.city} onChange={handleChange} placeholder="Например: Алматы" />
        </label>
      </section>

      {isLoading && (
        <section className="catalog-list">
          {[1, 2, 3].map(item => <div className="skeleton-row" key={item} />)}
        </section>
      )}

      {!isLoading && programs.length === 0 && (
        <section className="empty-state panel">
          <h2>Программы не найдены</h2>
          <p>Попробуйте изменить город, уровень обучения или тип учебного заведения.</p>
        </section>
      )}

      {!isLoading && programs.length > 0 && (
        <section className="catalog-list">
          {programs.map(program => (
            <ProgramCard program={program} key={program.id} />
          ))}
        </section>
      )}
    </main>
  );
}
