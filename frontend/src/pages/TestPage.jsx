import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function TestPage() {
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTest();
  }, []);

  async function loadTest() {
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
      setMessage(error.response?.data?.message || 'Ошибка загрузки теста');
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
      setMessage('Ответьте на все вопросы');
      return;
    }

    try {
      await api.post(`/api/test/${test.id}/submit`, {
        answers
      });

      navigate('/results');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка отправки теста');
    }
  }

  if (!test) {
    return (
      <div className="page">
        <div className="card">
          <p>{message || 'Загрузка теста...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>{test.title}</h1>
        <p>{test.description}</p>

        <form onSubmit={handleSubmit}>
          {questions.map((question, index) => (
            <div key={question.id} className="card">
              <h3>
                {index + 1}. {question.questionText}
              </h3>

              {question.answers.map(answer => (
                <label
                  key={answer.id}
                  style={{
                    display: 'block',
                    padding: '10px 0',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={selectedAnswers[question.id] === answer.id}
                    onChange={() => handleSelect(question.id, answer.id)}
                  />{' '}
                  {answer.text}
                </label>
              ))}
            </div>
          ))}

          {message && <p className="error">{message}</p>}

          <button className="button" type="submit">
            Завершить тест
          </button>
        </form>
      </div>
    </div>
  );
}