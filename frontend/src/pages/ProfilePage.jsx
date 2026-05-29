import React, { useEffect, useState } from 'react';
import api from '../api/axios';

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

  useEffect(() => {
    loadProfile();
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

    try {
      await api.post('/api/profile', {
        educationLevel: form.educationLevel,
        city: form.city,
        interests: splitText(form.interests),
        subjects: splitText(form.subjects),
        skills: splitText(form.skills),
        careerGoals: form.careerGoals
      });

      setMessage('Анкета сохранена');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка сохранения анкеты');
    }
  }

  return (
    <div className="page">
        <div className="hero">
            <h1>Подбор профессии и учебного заведения</h1>
            <p>
                Заполните анкету, пройдите тест, и система подберёт подходящие специальности,
                колледжи или университеты на основе ваших интересов, предметов и навыков.
            </p>
        </div>
      <div className="card">
        <h1>Анкета абитуриента</h1>
        <p>Заполните данные, чтобы система подобрала подходящие специальности.</p>

        <form onSubmit={handleSubmit}>
          <label>Куда поступаете?</label>
          <select
            className="select"
            name="educationLevel"
            value={form.educationLevel}
            onChange={handleChange}
          >
            <option value="grade_9">После 9 класса — колледж</option>
            <option value="grade_11">После 11 класса — университет</option>
          </select>

          <label>Город</label>
          <input
            className="input"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Например: Алматы"
          />

          <label>Интересы</label>
          <input
            className="input"
            name="interests"
            value={form.interests}
            onChange={handleChange}
            placeholder="IT, технологии, робототехника"
          />

          <label>Любимые предметы</label>
          <input
            className="input"
            name="subjects"
            value={form.subjects}
            onChange={handleChange}
            placeholder="информатика, математика"
          />

          <label>Навыки</label>
          <input
            className="input"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="логика, анализ, командная работа"
          />

          <label>Карьерная цель</label>
          <textarea
            className="textarea"
            name="careerGoals"
            value={form.careerGoals}
            onChange={handleChange}
            rows="4"
            placeholder="Например: хочу стать программистом"
          />

          <button className="button" type="submit">
            Сохранить анкету
          </button>
        </form>

        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
}