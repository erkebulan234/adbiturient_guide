import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, saveProfile } from '../api/profile.api';
import { getTestResults } from '../api/test.api';
import { getRecommendations } from '../api/recommendations.api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';

const PROFILE_FIELDS = ['city', 'interests', 'subjects', 'skills', 'careerGoals'];


function OnboardingBanner({ onDismiss }) {
  return (
    <section className="panel" style={{
      background: 'linear-gradient(135deg, #2f5f4f 0%, #1a3d30 100%)',
      color: '#fff',
      padding: '28px 32px',
      marginBottom: 24,
      position: 'relative'
    }}>
      <p className="kicker" style={{ color: 'rgba(255,255,255,0.7)' }}>Добро пожаловать</p>
      <h2 style={{ color: '#fff', marginBottom: 8 }}>Три шага до персонального подбора</h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560, marginBottom: 20 }}>
        Заполните анкету, пройдите тест и получите список подходящих программ
        с объяснением почему они вам подходят.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
          <span style={{ fontWeight: 800 }}>1</span>
          <span style={{ fontSize: 14 }}>Заполните анкету ниже</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
          <span style={{ fontWeight: 800 }}>2</span>
          <span style={{ fontSize: 14 }}>Пройдите тест</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
          <span style={{ fontWeight: 800 }}>3</span>
          <span style={{ fontSize: 14 }}>Получите рекомендации</span>
        </div>
      </div>

      <button
        onClick={onDismiss}
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(255,255,255,0.15)',
          border: 'none', borderRadius: 999,
          color: '#fff', cursor: 'pointer',
          padding: '6px 12px', fontSize: 13, fontWeight: 700
        }}
      >
        Понятно ×
      </button>
    </section>
  );
}

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

function splitText(value) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export default function ProfilePage() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    educationLevel: 'grade_9',
    city: '',
    interests: '',
    subjects: '',
    skills: '',
    careerGoals: ''
  });
  const [testResults, setTestResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('onboarding_dismissed') !== 'true';
  });

  function dismissOnboarding() {
    localStorage.setItem('onboarding_dismissed', 'true');
    setShowOnboarding(false);
  }


  useEffect(() => {
    loadProfile();
    loadProgress();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      if (data) {
        setForm({
          educationLevel: data.education_level || 'grade_9',
          city: data.city || '',
          interests: (data.interests || []).join(', '),
          subjects: (data.subjects || []).join(', '),
          skills: (data.skills || []).join(', '),
          careerGoals: data.career_goals || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadProgress() {
    try {
      const [tests, recs] = await Promise.all([
        getTestResults(),
        getRecommendations()
      ]);
      setTestResults(Array.isArray(tests) ? tests : []);
      setRecommendations(Array.isArray(recs) ? recs : []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await saveProfile({
        educationLevel: form.educationLevel,
        city: form.city,
        interests: splitText(form.interests),
        subjects: splitText(form.subjects),
        skills: splitText(form.skills),
        careerGoals: form.careerGoals
      });
      showToast({
        title: 'Анкета сохранена',
        description: 'Теперь рекомендации будут точнее.'
      });
      await loadProgress();
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Ошибка',
        description: err.response?.data?.message || 'Не удалось сохранить анкету'
      });
    } finally {
      setIsSaving(false);
    }
  }

  const completion = useMemo(() => {
    const filled = PROFILE_FIELDS.filter(f => String(form[f] || '').trim()).length;
    return Math.round((filled / PROFILE_FIELDS.length) * 100);
  }, [form]);

  const hasProfile = completion >= 60;
  const hasTest = testResults.length > 0;
  const hasRecommendations = recommendations.length > 0;

  return (
    <main className="page">
      {showOnboarding && !hasProfile && !hasTest && (
        <OnboardingBanner onDismiss={dismissOnboarding} />
      )}
      <section className="intro-section">
        <div>
          <p className="kicker">Поступление без лишнего шума</p>
          <h1>Соберите понятный профиль и получите осмысленный подбор программ</h1>
          <p className="lead">
            Навигатор связывает ваши интересы, предметы, навыки и карьерную цель
            с реальными колледжами и университетами Казахстана.
          </p>
        </div>

        <div className="profile-summary">
          <div className="summary-header">
            <span>Готовность профиля</span>
            <strong>{completion}%</strong>
          </div>
          <ProgressLine value={completion} />
          <p>Чем точнее анкета, тем меньше случайных вариантов в рекомендациях.</p>
        </div>
      </section>

      <section className="overview-grid">
        <OverviewStat label="Анкета"  value={`${completion}%`}        note="заполнено"      />
        <OverviewStat label="Тест"    value={hasTest ? 'Пройден' : '–'} note={`${testResults.length} результатов`} />
        <OverviewStat label="Подбор"  value={recommendations.length}   note="рекомендаций"  />
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
              <p>
                Заполните только то, что действительно помогает системе понять
                ваш образовательный контекст.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <Select
              label="Куда поступаете?"
              name="educationLevel"
              value={form.educationLevel}
              onChange={handleChange}
            >
              <option value="grade_9">После 9 класса — колледж</option>
              <option value="grade_11">После 11 класса — университет</option>
            </Select>

            <Input
              label="Город"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Например: Алматы"
            />

            <Input
              label="Интересы"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="IT, медицина, дизайн"
              hint="Перечислите через запятую"
            />

            <Input
              label="Любимые предметы"
              name="subjects"
              value={form.subjects}
              onChange={handleChange}
              placeholder="математика, биология, информатика"
              hint="Перечислите через запятую"
            />

            <Input
              label="Навыки"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="анализ, коммуникация, логика"
              hint="Перечислите через запятую"
            />

            <Textarea
              label="Карьерная цель"
              name="careerGoals"
              value={form.careerGoals}
              onChange={handleChange}
              rows={4}
              placeholder="Например: хочу стать разработчиком образовательных сервисов"
              className="wide"
            />

            <div className="form-actions wide">
              <Button type="submit" isLoading={isSaving} size="lg">
                Сохранить анкету
              </Button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}