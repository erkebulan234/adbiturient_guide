import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useProfile, useSaveProfile, useTestResults, useRecommendations } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input, { Select, Textarea } from '../components/Input';
import { useReveal } from '../hooks/useReveal';

const PROFILE_FIELDS = ['city', 'interests', 'subjects', 'skills', 'careerGoals'];

function OnboardingBanner({ onDismiss }) {
  return (
    <section className="panel" style={{
      background: 'linear-gradient(135deg, #2f5f4f 0%, #1a3d30 100%)',
      color: 'var(--text)', padding: '28px 32px', marginBottom: 24, position: 'relative'
    }}>
      <p className="kicker" style={{ color: 'rgba(255,255,255,0.7)' }}>Добро пожаловать</p>
      <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Три шага до персонального подбора</h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560, marginBottom: 20 }}>
        Заполните анкету, пройдите тест и получите список подходящих программ
        с объяснением почему они вам подходят.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {['Заполните анкету ниже', 'Пройдите тест', 'Получите рекомендации'].map((text, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
            <span style={{ fontWeight: 800 }}>{i + 1}</span>
            <span style={{ fontSize: 14 }}>{text}</span>
          </div>
        ))}
      </div>
      <button onClick={onDismiss} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 999,
        color: '#fff', cursor: 'pointer', padding: '6px 12px', fontSize: 13, fontWeight: 700
      }}>
        Понятно ×
      </button>
    </section>
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

function TagList({ values, onRemove }) {
  if (values.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
      {values.map((tag, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'var(--ui-badge-fanger, #fff1ef)', color: 'var(--danger)',
          borderRadius: 999, padding: '3px 10px', fontSize: 13, fontWeight: 600
        }}>
          {tag}
          <button
            type="button"
            onClick={() => onRemove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--danger)', padding: 0, fontSize: 14, lineHeight: 1 }}
            aria-label={`Удалить ${tag}`}
          >×</button>
        </span>
      ))}
    </div>
  );
}

function splitText(value) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export default function ProfilePage() {
  useReveal();
  const { showToast } = useToast();

  // ── React Query ──
  const { data: profileData } = useProfile();
  const saveProfileMutation   = useSaveProfile();
  const { data: testResults = [] }     = useTestResults();
  const { data: recommendations = [] } = useRecommendations();

  const [form, setForm] = useState({
    educationLevel:  'grade_9',
    city:            '',
    interests:       '',
    subjects:        '',
    skills:          '',
    careerGoals:     '',
    entScore:        '',
    dislikeSubjects: '',
    dislikeFields:   '',
  });

  const [dislikeSubjectsInput, setDislikeSubjectsInput] = useState('');
  const [dislikeFieldsInput,   setDislikeFieldsInput]   = useState('');

  const dislikeSubjectsArr = useMemo(() => splitText(form.dislikeSubjects), [form.dislikeSubjects]);
  const dislikeFieldsArr   = useMemo(() => splitText(form.dislikeFields),   [form.dislikeFields]);

  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('onboarding_dismissed') !== 'true'
  );

  // Заполнить форму когда данные профиля загрузились
  useEffect(() => {
    if (profileData) {
      setForm({
        educationLevel:  profileData.education_level  || 'grade_9',
        city:            profileData.city             || '',
        interests:       (profileData.interests       || []).join(', '),
        subjects:        (profileData.subjects        || []).join(', '),
        skills:          (profileData.skills          || []).join(', '),
        careerGoals:     profileData.career_goals     || '',
        entScore:        profileData.ent_score != null ? String(profileData.ent_score) : '',
        dislikeSubjects: (profileData.dislike_subjects || []).join(', '),
        dislikeFields:   (profileData.dislike_fields   || []).join(', '),
      });
    }
  }, [profileData]);

  function dismissOnboarding() {
    localStorage.setItem('onboarding_dismissed', 'true');
    setShowOnboarding(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function addDislikeTag(field, inputValue, setInputValue, e) {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const tag = inputValue.trim().replace(/,$/, '');
    if (!tag) return;
    setForm(prev => {
      const current = splitText(prev[field]);
      if (current.includes(tag)) return prev;
      return { ...prev, [field]: [...current, tag].join(', ') };
    });
    setInputValue('');
  }

  function removeDislikeTag(field, index) {
    setForm(prev => {
      const arr = splitText(prev[field]);
      arr.splice(index, 1);
      return { ...prev, [field]: arr.join(', ') };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const entScore = form.entScore === '' ? null : Number(form.entScore);
    if (entScore !== null && (isNaN(entScore) || entScore < 0 || entScore > 140)) {
      showToast({ tone: 'danger', title: 'Ошибка', description: 'Балл ЕНТ: число от 0 до 140' });
      return;
    }

    saveProfileMutation.mutate({
      educationLevel:  form.educationLevel,
      city:            form.city,
      interests:       splitText(form.interests),
      subjects:        splitText(form.subjects),
      skills:          splitText(form.skills),
      careerGoals:     form.careerGoals,
      entScore,
      dislikeSubjects: splitText(form.dislikeSubjects),
      dislikeFields:   splitText(form.dislikeFields),
    }, {
      onSuccess: () => showToast({ title: 'Анкета сохранена', description: 'Теперь рекомендации будут точнее.' }),
      onError: (err) => showToast({
        tone: 'danger', title: 'Ошибка',
        description: err.response?.data?.message || 'Не удалось сохранить анкету'
      })
    });
  }

  const completion = useMemo(() => {
    const filled = PROFILE_FIELDS.filter(f => String(form[f] || '').trim()).length;
    return Math.round((filled / PROFILE_FIELDS.length) * 100);
  }, [form]);

  const hasProfile         = completion >= 60;
  const hasTest            = testResults.length > 0;
  const hasRecommendations = recommendations.length > 0;
  const isSaving           = saveProfileMutation.isPending;

  return (
    <main className="page">
      {showOnboarding && !hasProfile && !hasTest && (
        <OnboardingBanner onDismiss={dismissOnboarding} />
      )}

      <section className="intro-section reveal-up">
        <div>
          <p className="kicker">Поступление без лишнего шума</p>
          <h1>Соберите понятный профиль и получите осмысленный подбор программ</h1>
          <p className="lead">
            Навигатор связывает ваши интересы, предметы, навыки и карьерную цель
            с реальными колледжами и университетами Казахстана.
          </p>
        </div>
        <div className="profile-summary">
          <ProgressBar value={completion} max={100} label="Готовность профиля" showValue />
          <p>Чем точнее анкета, тем меньше случайных вариантов в рекомендациях.</p>
        </div>
      </section>

      <section className="overview-grid reveal-up" style={{ '--delay': '90ms' }}>
        <OverviewStat label="Анкета" value={`${completion}%`}          note="заполнено" />
        <OverviewStat label="Тест"   value={hasTest ? 'Пройден' : '–'} note={`${testResults.length} результатов`} />
        <OverviewStat label="Подбор" value={recommendations.length}    note="рекомендаций" />
      </section>

      <section className="workspace-grid reveal-up" style={{ '--delay': '180ms' }}>
        <aside className="panel">
          <p className="kicker">Следующие шаги</p>
          <div className="steps-list">
            <NextStep number="1" title="Анкета"
              description={hasProfile ? 'Базовый профиль уже собран.' : 'Добавьте город, интересы, предметы и цель.'}
              complete={hasProfile} to="/profile"
              action={hasProfile ? 'Уточнить данные' : 'Заполнить анкету'} />
            <NextStep number="2" title="Профориентация"
              description={hasTest ? 'Результаты теста уже учитываются.' : 'Тест помогает понять подходящие типы задач.'}
              complete={hasTest} to="/test"
              action={hasTest ? 'Пройти заново' : 'Начать тест'} />
            <NextStep number="3" title="Рекомендации"
              description={hasRecommendations ? 'Подбор программ уже готов.' : 'Сформируйте список после анкеты и теста.'}
              complete={hasRecommendations} to="/results"
              action="Открыть подбор" />
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

          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <Select label="Куда поступаете?" name="educationLevel"
              value={form.educationLevel} onChange={handleChange}>
              <option value="grade_9">После 9 класса — колледж</option>
              <option value="grade_11">После 11 класса — университет</option>
            </Select>

            <Input label="Город" name="city" value={form.city}
              onChange={handleChange} placeholder="Например: Алматы" />

            <Input label="Интересы" name="interests" value={form.interests}
              onChange={handleChange} placeholder="IT, медицина, дизайн"
              hint="Перечислите через запятую" />

            <Input label="Любимые предметы" name="subjects" value={form.subjects}
              onChange={handleChange} placeholder="математика, биология, информатика"
              hint="Перечислите через запятую" />

            <Input label="Навыки" name="skills" value={form.skills}
              onChange={handleChange} placeholder="анализ, коммуникация, логика"
              hint="Перечислите через запятую" />

            <Textarea label="Карьерная цель" name="careerGoals" value={form.careerGoals}
              onChange={handleChange} rows={4} className="wide"
              placeholder="Например: хочу стать разработчиком образовательных сервисов" />

            <div className="wide" style={{ borderTop: '1px solid var(--line)', margin: '8px 0', paddingTop: 20 }}>
              <p className="kicker" style={{ marginBottom: 4 }}>Точная настройка</p>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 0 }}>
                Эти поля помогают исключить неподходящие варианты и учесть балл ЕНТ.
              </p>
            </div>

            <Input
              label="Балл ЕНТ" name="entScore" type="number"
              value={form.entScore} onChange={handleChange}
              placeholder="Например: 95"
              hint="От 0 до 140. Программы с порогом выше вашего балла получат штраф."
              min={0} max={140}
            />

            <div className="wide">
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
                Не нравятся предметы
              </label>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                Специальности, требующие этих предметов, получат штраф. Введите и нажмите Enter.
              </p>
              <TagList values={dislikeSubjectsArr} onRemove={(i) => removeDislikeTag('dislikeSubjects', i)} />
              <input
                className="input"
                value={dislikeSubjectsInput}
                onChange={e => setDislikeSubjectsInput(e.target.value)}
                onKeyDown={e => addDislikeTag('dislikeSubjects', dislikeSubjectsInput, setDislikeSubjectsInput, e)}
                placeholder="химия, история… Enter чтобы добавить"
              />
            </div>

            <div className="wide">
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
                Не хочу в сферу
              </label>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                Специальности из этих сфер получат штраф. Введите и нажмите Enter.
              </p>
              <TagList values={dislikeFieldsArr} onRemove={(i) => removeDislikeTag('dislikeFields', i)} />
              <input
                className="input"
                value={dislikeFieldsInput}
                onChange={e => setDislikeFieldsInput(e.target.value)}
                onKeyDown={e => addDislikeTag('dislikeFields', dislikeFieldsInput, setDislikeFieldsInput, e)}
                placeholder="медицина, право… Enter чтобы добавить"
              />
            </div>

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