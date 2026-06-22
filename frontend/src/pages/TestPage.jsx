import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTests, useTestById, useSubmitTest, useTestResults } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { Loader } from '../components/Spinner';

const CATEGORY_LABELS = {
  interest: 'Интересы', activity: 'Деятельность', subject: 'Предметы',
  skill: 'Навыки', self_study: 'Самопознание', project: 'Проект',
  personality: 'Личность', values: 'Ценности', environment: 'Среда',
  motivation: 'Мотивация', creation: 'Творчество', career: 'Карьера',
  outcome: 'Результат', outcome2: 'Будущее', choice: 'Выбор',
  computer: 'Привычки', social: 'Люди', risk: 'Роль',
  impact: 'Влияние', thinking: 'Мышление',
};

// SVG иконки по категориям
function CategoryIcon({ category, size = 20 }) {
  const icons = {
    interest: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 2 13 9 20 9"/><path d="M21 15.5A9 9 0 1 1 8 3"/>
      </svg>
    ),
    subject: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    skill: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    self_study: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    ),
    project: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
    ),
    personality: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    values: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    environment: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    motivation: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    creation: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
      </svg>
    ),
    career: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    outcome: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    outcome2: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    choice: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    ),
    computer: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
      </svg>
    ),
    social: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    risk: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
      </svg>
    ),
    impact: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    thinking: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };
  return icons[category] || icons.thinking;
}

function CompletedScreen({ lastResult, onRetake }) {
  const date = lastResult?.created_at
    ? new Date(lastResult.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <main className="page" style={{ maxWidth: 600, margin: '0 auto', padding: '80px 18px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <p className="kicker">Профориентационный тест</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 12 }}>Тест пройден</h1>
        <p className="lead" style={{ fontSize: 18, marginBottom: 8 }}>
          Результаты уже учитываются в ваших рекомендациях.
        </p>
        {date && (
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 40 }}>
            Последнее прохождение: {date}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            to="/results"
            className="primary-button"
            style={{ width: 280, justifyContent: 'center' }}
          >
            Посмотреть рекомендации
          </Link>
          <button
            onClick={onRetake}
            style={{
              width: 280, padding: '11px 17px', borderRadius: 999,
              border: '1px solid var(--line-strong)', background: 'var(--paper)',
              color: 'var(--muted)', cursor: 'pointer', fontWeight: 700,
              fontSize: 15, transition: '0.18s'
            }}
          >
            Пройти тест заново
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TestPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const autoAdvanceRef = useRef(null);

  const { data: tests = [], isLoading: testsLoading } = useTests();
  const firstTestId = tests[0]?.id;
  const { data: testData, isLoading: testLoading } = useTestById(firstTestId);
  const { data: testResults = [], isLoading: resultsLoading } = useTestResults();
  const submitMutation = useSubmitTest();

  const test = testData?.test;
  const questions = testData?.questions || [];
  const alreadyCompleted = testResults.length > 0 && !retaking;
  const lastResult = testResults[0];

  const current = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const currentAnswerId = current ? selectedAnswers[current.id] : null;

  useEffect(() => {
    return () => clearTimeout(autoAdvanceRef.current);
  }, []);

  function goTo(index, dir) {
    if (animating) return;
    clearTimeout(autoAdvanceRef.current);
    setAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex(index);
      setAnimating(false);
    }, 220);
  }

  function handleSelect(questionId, answerId) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
    if (!isLast) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        goTo(currentIndex + 1, 'forward');
      }, 500);
    }
  }

  async function handleSubmit() {
    const unanswered = questions.filter(q => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      const firstIdx = questions.indexOf(unanswered[0]);
      showToast({
        tone: 'danger',
        title: 'Есть неотвеченные вопросы',
        description: `Пропущено: ${unanswered.length}`
      });
      goTo(firstIdx, firstIdx > currentIndex ? 'forward' : 'back');
      return;
    }

    submitMutation.mutate(
      { testId: test.id, answers: Object.values(selectedAnswers) },
      {
        onSuccess: () => {
          showToast({ title: 'Тест завершён', description: 'Формируем рекомендации...' });
          navigate('/results');
        },
        onError: err => showToast({
          tone: 'danger', title: 'Ошибка',
          description: err.response?.data?.message || 'Не удалось отправить тест'
        })
      }
    );
  }

  function handleRetake() {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setDirection('forward');
    setRetaking(true);
  }

  const isLoading = testsLoading || testLoading || resultsLoading;

  if (isLoading) {
    return <main className="page"><Loader title="Загружаем тест" description="Секунду..." /></main>;
  }

  // Экран "тест пройден"
  if (alreadyCompleted) {
    return <CompletedScreen lastResult={lastResult} onRetake={handleRetake} />;
  }

  if (!test || questions.length === 0) {
    return (
      <main className="page" style={{ maxWidth: 780, margin: '0 auto', padding: '34px 18px' }}>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p className="kicker">Профориентация</p>
          <h2>Тест недоступен</h2>
          <p style={{ color: 'var(--muted)' }}>Администратор сможет добавить вопросы в панели управления.</p>
        </div>
      </main>
    );
  }

  const categoryLabel = CATEGORY_LABELS[current?.category] || '';

  return (
    <main className="page test-page" style={{ maxWidth: 760, margin: '0 auto', padding: '34px 18px 80px' }}>

      {/* Прогресс */}
      <div style={{ marginBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
            {currentIndex + 1} / {questions.length}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
            {progress}%
          </span>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => i !== currentIndex && goTo(i, i > currentIndex ? 'forward' : 'back')}
              style={{
                flex: 1, height: 4, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
                background: selectedAnswers[q.id]
                  ? 'var(--accent)'
                  : i === currentIndex ? 'var(--line-strong)' : 'var(--line)',
                transition: 'background 0.3s ease',
              }}
              title={`Вопрос ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Карточка вопроса */}
      <div
        key={currentIndex}
        style={{
          animation: animating ? 'none'
            : direction === 'forward'
              ? 'slideInRight 0.28s cubic-bezier(0.22,1,0.36,1) both'
              : 'slideInLeft 0.28s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Категория */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: 'var(--accent)', display: 'flex' }}>
            <CategoryIcon category={current?.category} size={18} />
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            fontSize: 11, fontWeight: 780, letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>
            {categoryLabel}
          </span>
        </div>

        {/* Вопрос */}
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 30px)', lineHeight: 1.3,
          letterSpacing: '-0.035em', fontWeight: 740,
          marginBottom: 28, color: 'var(--text)', maxWidth: 620
        }}>
          {current?.questionText}
        </h2>

        {/* Ответы */}
        <div style={{ display: 'grid', gap: 10 }}>
          {current?.answers.map((answer, i) => {
            const isSelected = currentAnswerId === answer.id;
            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(current.id, answer.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--line)'}`,
                  background: isSelected ? 'var(--accent-soft)' : 'var(--paper)',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                  textAlign: 'left', fontWeight: isSelected ? 720 : 500,
                  fontSize: 15, lineHeight: 1.5,
                  transition: 'all 0.16s ease',
                  boxShadow: isSelected ? '0 0 0 3px rgba(47,95,79,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: isSelected ? 'var(--accent)' : 'var(--paper-soft)',
                  color: isSelected ? 'var(--bg)' : 'var(--muted)',
                  fontSize: 12, fontWeight: 800, transition: 'all 0.16s ease',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {answer.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Навигация */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 36, gap: 12
      }}>
        <button
          onClick={() => goTo(currentIndex - 1, 'back')}
          disabled={isFirst}
          style={{
            padding: '10px 18px', borderRadius: 999,
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--muted)', cursor: isFirst ? 'not-allowed' : 'pointer',
            fontWeight: 700, opacity: isFirst ? 0.35 : 1, fontSize: 14,
            transition: '0.16s', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад
        </button>

        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 650 }}>
          {answeredCount} из {questions.length} отвечено
        </span>

        {isLast ? (
          <Button onClick={handleSubmit} isLoading={submitMutation.isPending} size="lg">
            Завершить тест
          </Button>
        ) : (
          <button
            onClick={() => goTo(currentIndex + 1, 'forward')}
            style={{
              padding: '10px 18px', borderRadius: 999, border: 'none',
              background: currentAnswerId ? 'var(--text)' : 'var(--line)',
              color: currentAnswerId ? 'var(--bg)' : 'var(--muted)',
              cursor: currentAnswerId ? 'pointer' : 'default',
              fontWeight: 700, fontSize: 14, transition: '0.16s',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            Далее
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </main>
  );
}