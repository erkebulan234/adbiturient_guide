import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const profileFields = ['city', 'interests', 'subjects', 'skills', 'careerGoals'];

function ProgressLine({ value }) {
  return (
    <div className="progress-line" aria-label={`Заполнено ${value}%`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function OverviewStat({ label, value, note }) {
  return (
    <div className="overview-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function NextStep({ number, title, description, complete, to, action }) {
  return (
    <article className="next-step">
      <div className="step-number">{number}</div>
      <div>
        <div className="step-title-row">
          <h3>{title}</h3>
          <span className={`small-status ${complete ? 'done' : ''}`}>
            {complete ? 'Готово' : 'В работе'}
          </span>
        </div>
        <p>{description}</p>
        <Link className="text-link" to={to}>{action}</Link>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    educationLevel: 'grade_9',
    city: '',
    interests: '',
    subjects: '',
    skills: '',
    careerGoals: ''
  });

  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadProgress();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get('/api/profile');

      if (response.data) {
        setForm({
          educationLevel: response.data.education_level || 'grade_9',
          city: response.data.city || '',
          interests: (response.data.interests || []).join(', '),
          subjects: (response.data.subjects || []).join(', '),
          skills: (response.data.skills || []).join(', '),
          careerGoals: response.data.career_goals || ''
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function loadProgress() {
    try {
      const [testResponse, recommendationsResponse] = await Promise.all([
        api.get('/api/test/results'),
        api.get('/api/recommendations')
      ]);

      setTestResults(testResponse.data);
      setRecommendations(recommendationsResponse.data);
    } catch (error) {
      console.log(error);
    }
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function splitText(value) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);

    try {
      await api.post('/api/profile', {
        educationLevel: form.educationLevel,
        city: form.city,
        interests: splitText(form.interests),
        subjects: splitText(form.subjects),
        skills: splitText(form.skills),
        careerGoals: form.careerGoals
      });

      setMessage('Анкета сохранена. Теперь рекомендации будут точнее.');
      await loadProgress();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Не удалось сохранить анкету');
    } finally {
      setIsSaving(false);
    }
  }

  const completion = useMemo(() => {
    const filled = profileFields.filter(field => String(form[field] || '').trim()).length;
    return Math.round((filled / profileFields.length) * 100);
  }, [form]);

  const hasProfile = completion >= 60;
  const hasTest = testResults.length > 0;
  const hasRecommendations = recommendations.length > 0;

  return (
    <main className="page">
      <section className="intro-section">
        <div>
          <p className="kicker">Поступление без лишнего шума</p>
          <h1>Соберите понятный профиль и получите осмысленный подбор программ</h1>
          <p className="lead">
            Навигатор связывает ваши интересы, предметы, навыки и карьерную цель с реальными колледжами и университетами Казахстана.
          </p>
        </div>

        <div className="profile-summary">
          <div className="summary-header">
            <span>Готовность профиля</span>
            <strong>{completion}%</strong>
          </div>
          <ProgressLine value={completion} />
          <p>
            Чем точнее анкета, тем меньше случайных вариантов в рекомендациях.
          </p>
        </div>
      </section>

      <section className="overview-grid">
        <OverviewStat label="Анкета" value={`${completion}%`} note="заполнено" />
        <OverviewStat label="Тест" value={hasTest ? 'Пройден' : 'Не пройден'} note={`${testResults.length} ответов`} />
        <OverviewStat label="Подбор" value={recommendations.length} note="рекомендаций" />
      </section>

      <section className="workspace-grid">
        <aside className="panel">
          <p className="kicker">Следующие шаги</p>

          <div className="steps-list">
            <NextStep
              number="1"
              title="Анкета"
              description={hasProfile ? 'Базовый профиль уже собран.' : 'Добавьте город, интересы, предметы и цель.'}
              complete={hasProfile}
              to="/profile"
              action={hasProfile ? 'Уточнить данные' : 'Заполнить анкету'}
            />

            <NextStep
              number="2"
              title="Профориентация"
              description={hasTest ? 'Результаты теста уже учитываются.' : 'Тест помогает понять подходящие типы задач.'}
              complete={hasTest}
              to="/test"
              action={hasTest ? 'Пройти заново' : 'Начать тест'}
            />

            <NextStep
              number="3"
              title="Рекомендации"
              description={hasRecommendations ? 'Подбор программ уже готов.' : 'Сформируйте список после анкеты и теста.'}
              complete={hasRecommendations}
              to="/results"
              action="Открыть подбор"
            />
          </div>
        </aside>

        <section className="panel main-panel">
          <div className="section-heading">
            <div>
              <p className="kicker">Профиль</p>
              <h2>Анкета абитуриента</h2>
              <p>Заполните только то, что действительно помогает системе понять ваш образовательный контекст.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Куда поступаете?
              <select className="select" name="educationLevel" value={form.educationLevel} onChange={handleChange}>
                <option value="grade_9">После 9 класса — колледж</option>
                <option value="grade_11">После 11 класса — университет</option>
              </select>
            </label>

            <label>
              Город
              <input className="input" name="city" value={form.city} onChange={handleChange} placeholder="Например: Алматы" />
            </label>

            <label>
              Интересы
              <input className="input" name="interests" value={form.interests} onChange={handleChange} placeholder="IT, медицина, дизайн" />
            </label>

            <label>
              Любимые предметы
              <input className="input" name="subjects" value={form.subjects} onChange={handleChange} placeholder="математика, биология, информатика" />
            </label>

            <label>
              Навыки
              <input className="input" name="skills" value={form.skills} onChange={handleChange} placeholder="анализ, коммуникация, логика" />
            </label>

            <label className="wide">
              Карьерная цель
              <textarea
                className="textarea"
                name="careerGoals"
                value={form.careerGoals}
                onChange={handleChange}
                rows="4"
                placeholder="Например: хочу стать разработчиком образовательных сервисов"
              />
            </label>

            <div className="form-actions wide">
              <button className="primary-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Сохраняем...' : 'Сохранить анкету'}
              </button>
              {message && <p className={message.includes('удалось') ? 'error' : 'success'}>{message}</p>}
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}