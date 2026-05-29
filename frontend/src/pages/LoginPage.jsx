import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', form);

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка входа');
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 460, margin: '60px auto' }}>
        <h1>Вход</h1>
        <p>Войдите, чтобы получить рекомендации по специальности.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Пароль</label>
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}

          <button className="button" type="submit">
            Войти
          </button>
        </form>

        <p>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}