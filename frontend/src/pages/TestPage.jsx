import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ProgressLine({ value }) {
  return (
    <div className="progress-line">
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export default function TestPage() {
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTest();
  }, []);

  async function loadTest() {
    setIsLoading(true);

    try {
      const testsResponse = await api.get('/api/test');
      const firstTest = testsResponse.data[0];

      if (!firstTest) {
        setMessage('Тесты пока не добавлены');
        return;
      }

      const testResponse = await api.get(`/api/test/${firstTest.id}`);

      setTest(testResponse.data.test);
      setQuestions(testResponse.data.questions);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Не удалось загрузить тест');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(questionId, answerId) {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const answers = Object.values(selectedAnswers);

    if (answers.length !== questions.length) {
      setMessage('Ответьте на все вопросы, чтобы завершить тест');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/api/test/${test.id}/submit`, { answers });
      navigate('/results');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Не удалось отправить тест');
    } finally {
      setIsSubmitting(false);
    }
  }

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((Object.keys(selectedAnswers).length / questions.length) * 100);
  }, [questions, selectedAnswers]);

  if (isLoading) {
    return (
      <main className="page">
        <section className="panel loading-panel">
          <div className="skeleton-line short" />
          <div className="skeleton-line long" />
          <div className="skeleton-row" />
        </section>
      </main>
    );
  }

  if (!test) {
    return (
      <main className="page">
        <section className="empty-state panel">
          <p className="kicker">Профориентация</p>
          <h2>{message || 'Тест недоступен'}</h2>
          <p>Администратор сможет добавить вопросы в панели управления.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page test-page">
      <section className="test-header">
        <div>
          <p className="kicker">Профориентационный тест</p>
          <h1>{test.title}</h1>
          <p className="lead">{test.description}</p>
        </div>

        <aside className="panel test-progress-card">
          <div className="summary-header">
            <span>Прогресс</span>
            <strong>{progress}%</strong>
          </div>
          <ProgressLine value={progress} />
          <p>{Object.keys(selectedAnswers).length} из {questions.length} вопросов</p>
        </aside>
      </section>

      <form onSubmit={handleSubmit} className="questions-layout">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="question-card">
            <legend>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {question.questionText}
            </legend>

            <div className="answer-list">
              {question.answers.map(answer => {
                const isSelected = selectedAnswers[question.id] === answer.id;

                return (
                  <label className={`answer-option ${isSelected ? 'selected' : ''}`} key={answer.id}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={isSelected}
                      onChange={() => handleSelect(question.id, answer.id)}
                    />
                    <span>{answer.text}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="sticky-submit panel">
          <div>
            <strong>Готово на {progress}%</strong>
            <p>После отправки система обновит рекомендации.</p>
          </div>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем...' : 'Завершить тест'}
          </button>
        </div>

        {message && <p className="notice error">{message}</p>}
      </form>
    </main>
  );
}
