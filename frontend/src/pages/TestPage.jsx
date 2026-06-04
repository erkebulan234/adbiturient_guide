import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTests, getTestById, submitTest } from '../api/test.api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { Loader } from '../components/Spinner';
import { EmptyState } from '../components/ui';

function ProgressLine({ value }) {
  return (
    <div className="progress-line">
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export default function TestPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadTest(); }, []);

  async function loadTest() {
    setIsLoading(true);
    try {
      const tests = await getTests();
      const firstTest = tests[0];

      if (!firstTest) {
        setMessage('Тесты пока не добавлены');
        return;
      }

      const data = await getTestById(firstTest.id);
      setTest(data.test);
      setQuestions(data.questions);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Не удалось загрузить тест');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(questionId, answerId) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const answers = Object.values(selectedAnswers);
    if (answers.length !== questions.length) {
      showToast({
        tone: 'danger',
        title: 'Не все вопросы отвечены',
        description: `Осталось ответить: ${questions.length - answers.length}`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTest(test.id, answers);
      showToast({
        title: 'Тест завершён',
        description: 'Результаты сохранены. Перенаправляем на рекомендации.'
      });
      navigate('/results');
    } catch (err) {
      showToast({
        tone: 'danger',
        title: 'Ошибка',
        description: err.response?.data?.message || 'Не удалось отправить тест'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const answeredCount = Object.keys(selectedAnswers).length;

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((answeredCount / questions.length) * 100);
  }, [questions.length, answeredCount]);

  if (isLoading) {
    return (
      <main className="page">
        <Loader
          title="Загружаем тест"
          description="Готовим вопросы профориентации — займёт секунду."
        />
      </main>
    );
  }

  if (!test) {
    return (
      <main className="page">
        <EmptyState
          eyebrow="Профориентация"
          title={message || 'Тест недоступен'}
          description="Администратор сможет добавить вопросы в панели управления."
        />
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
          <p>{answeredCount} из {questions.length} вопросов</p>
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
                  <label
                    key={answer.id}
                    className={`answer-option ${isSelected ? 'selected' : ''}`}
                  >
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
          <Button type="submit" isLoading={isSubmitting} size="lg">
            Завершить тест
          </Button>
        </div>
      </form>
    </main>
  );
}