import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
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
      const response = await api.post('/auth/register', form);

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка регистрации');
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 460, margin: '60px auto' }}>
        <h1>Регистрация</h1>
        <p>Создайте аккаунт, чтобы заполнить анкету абитуриента.</p>

        <form onSubmit={handleSubmit}>
          <label>Имя</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

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
            Зарегистрироваться
          </button>
        </form>

        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}