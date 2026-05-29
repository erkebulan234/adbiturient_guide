import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Institutions() {
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({
    educationLevel: '',
    institutionType: '',
    city: ''
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms(customFilters = filters) {
    try {
      const params = {};

      if (customFilters.educationLevel) {
        params.educationLevel = customFilters.educationLevel;
      }

      if (customFilters.institutionType) {
        params.institutionType = customFilters.institutionType;
      }

      if (customFilters.city) {
        params.city = customFilters.city;
      }

      const response = await api.get('/api/programs', { params });
      setPrograms(response.data);
    } catch (error) {
      console.log(error);
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

  return (
    <div className="page">
      <div className="card">
        <h1>Каталог программ</h1>
        <p>Фильтруйте колледжи, университеты и специальности по уровню обучения, типу и городу.</p>

        <div className="grid">
          <div>
            <label>Уровень</label>
            <select
              className="select"
              name="educationLevel"
              value={filters.educationLevel}
              onChange={handleChange}
            >
              <option value="">Все</option>
              <option value="grade_9">После 9 класса</option>
              <option value="grade_11">После 11 класса</option>
            </select>
          </div>

          <div>
            <label>Тип заведения</label>
            <select
              className="select"
              name="institutionType"
              value={filters.institutionType}
              onChange={handleChange}
            >
              <option value="">Все</option>
              <option value="college">Колледж</option>
              <option value="university">Университет</option>
            </select>
          </div>

          <div>
            <label>Город</label>
            <input
              className="input"
              name="city"
              value={filters.city}
              onChange={handleChange}
              placeholder="Алматы"
            />
          </div>
        </div>
      </div>

      <div className="grid">
        {programs.map(program => (
          <div className="card" key={program.id}>
            <h2>{program.specialty_title}</h2>
            <p><b>Профессия:</b> {program.profession}</p>
            <p><b>Учебное заведение:</b> {program.institution_name}</p>
            <p><b>Тип:</b> {program.institution_type === 'college' ? 'Колледж' : 'Университет'}</p>
            <p><b>Город:</b> {program.institution_city}</p>
            <p><b>Стоимость:</b> {program.tuition_fee ? `${program.tuition_fee} тг/год` : 'Не указано'}</p>
            <p><b>Срок обучения:</b> {program.duration_years} года</p>
            <p><b>Язык:</b> {program.study_language}</p>
            <p><b>Форма:</b> {program.study_form}</p>
            <p><b>Нужные предметы:</b> {(program.required_subjects || []).join(', ')}</p>
            <p><b>Навыки:</b> {(program.required_skills || []).join(', ')}</p>
            <p><b>Зарплата:</b> {program.average_salary}</p>
            <p><b>Востребованность:</b> {program.demand_level}</p>
            <p><b>Грант:</b> {program.has_grant ? 'Есть' : 'Нет'}</p>
            <p><b>Минимальный балл:</b> {program.min_score}</p>

            {program.institution_website && (
              <a
                className="button"
                href={program.institution_website}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', marginTop: 10 }}
              >
                Сайт заведения
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}