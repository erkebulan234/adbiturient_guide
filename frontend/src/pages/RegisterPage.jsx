import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import logoMark from '../assets/navigator-logo-mark.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', form);

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Не удалось создать аккаунт');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <Link to="/" className="brand">
          <span className="brand-mark has-logo" aria-hidden="true">
            <img className="brand-logo" src={logoMark} alt="" />
          </span>
          <span className="brand-text">
            <strong>Навигатор</strong>
            <small>для абитуриента</small>
          </span>
        </Link>

        <div>
          <p className="kicker">Новый профиль</p>
          <h1>Начните с короткой анкеты, а не с бесконечного каталога</h1>
          <p className="lead">
            После регистрации вы сможете пройти тест и получить объяснимый список программ.
          </p>
        </div>
      </section>

      <section className="auth-card panel">
        <h2>Регистрация</h2>
        <p>Создайте аккаунт, чтобы сохранить прогресс и рекомендации.</p>

        <form onSubmit={handleSubmit} className="stack-form">
          <label>
            Имя
            <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Например: Алия" />
          </label>

          <label>
            Email
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Пароль
            <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Создаем...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт? <Link className="text-link" to="/login">Войти</Link>
        </p>
      </section>
    </main>
  );
}
