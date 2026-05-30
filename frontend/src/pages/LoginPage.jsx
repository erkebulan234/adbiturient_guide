import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import logoMark from '../assets/navigator-logo-mark.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const redirectTo = location.state?.from || '/profile';

  const [form, setForm] = useState({
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
      const response = await api.post('/auth/login', form);

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Не удалось войти');
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
          <p className="kicker">Возвращайтесь к подбору</p>
          <h1>Продолжите путь к подходящей программе</h1>
          <p className="lead">
            Войдите, чтобы открыть анкету, результаты теста и персональные рекомендации.
          </p>
        </div>
      </section>

      <section className="auth-card panel">
        <h2>Вход</h2>
        <p>Используйте email и пароль, указанные при регистрации.</p>

        <form onSubmit={handleSubmit} className="stack-form">
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
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className="auth-switch">
          Нет аккаунта? <Link className="text-link" to="/register">Зарегистрироваться</Link>
        </p>
      </section>
    </main>
  );
}
