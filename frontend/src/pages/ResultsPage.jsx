import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function ResultsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('Загрузка рекомендаций...');

  useEffect(() => {
    generateRecommendations();
  }, []);

  async function generateRecommendations() {
    try {
      await api.post('/api/recommendations/generate', {});
      const response = await api.get('/api/recommendations');

      setRecommendations(response.data);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка загрузки рекомендаций');
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Ваши рекомендации</h1>
        <p>
          Система учитывает анкету, интересы, предметы, навыки и результат профориентационного теста.
        </p>

        <div className="actions">
            <button className="button" onClick={generateRecommendations}>
                Обновить рекомендации
            </button>
            <Link className="button secondary" to="/test">
                Пройти тест заново
            </Link>
            <Link className="button secondary" to="/profile">
                Изменить анкету
            </Link>
        </div>

        {message && <p>{message}</p>}

        <div className="grid">
          {recommendations.map(item => (
            <div className="card" key={item.id}>
              <h2>{item.title}</h2>
              <p><b>Профессия:</b> {item.profession}</p>
              <p>{item.description}</p>

              <p><b>Учебное заведение:</b> {item.institution_name}</p>
              <p><b>Тип:</b> {item.institution_type === 'college' ? 'Колледж' : 'Университет'}</p>
              <p><b>Город:</b> {item.institution_city}</p>

              <p><b>Стоимость:</b> {item.tuition_fee ? `${item.tuition_fee} тг/год` : 'Не указано'}</p>
              <p><b>Срок обучения:</b> {item.duration_years} года</p>
              <p><b>Язык обучения:</b> {item.study_language}</p>
              <p><b>Форма обучения:</b> {item.study_form}</p>

              <p><b>Нужные предметы:</b> {(item.required_subjects || []).join(', ')}</p>
              <p><b>Навыки:</b> {(item.required_skills || []).join(', ')}</p>
              <p><b>Документы:</b> {(item.required_documents || []).join(', ')}</p>

              <p><b>Средняя зарплата:</b> {item.average_salary}</p>
              <p><b>Востребованность:</b> {item.demand_level}</p>
              <p><b>Грант:</b> {item.has_grant ? 'Есть' : 'Нет'}</p>
              <p><b>Минимальный балл:</b> {item.min_score}</p>

              <p>
                <b>Совпадение:</b> {item.match_percent || item.matchPercent || 0}%
              </p>

              <div style={{
                width: '100%',
                height: 10,
                background: '#e5e7eb',
                borderRadius: 999,
                overflow: 'hidden',
                marginBottom: 12
              }}>
                <div style={{
                  width: `${item.match_percent || item.matchPercent || 0}%`,
                  height: '100%',
                  background: '#2563eb'
                }} />
              </div>
              <p><b>Причина:</b> {item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}