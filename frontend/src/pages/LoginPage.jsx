import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import logoMark from '../assets/navigator-logo-mark.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const redirectTo = location.state?.from || '/profile';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.email) next.email = 'Введите email';
    if (!form.password) next.password = 'Введите пароль';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    if (Object.keys(next).length) { setErrors(next); return; }

    setIsLoading(true);
    try {
      const data = await login(form.email, form.password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Не удалось войти';
      showToast({ tone: 'danger', title: 'Ошибка входа', description: message });
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

        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button type="submit" isLoading={isLoading} size="lg">
            Войти
          </Button>
        </form>

        <p className="auth-switch">
          Нет аккаунта?{' '}
          <Link className="text-link" to="/register">Зарегистрироваться</Link>
        </p>
      </section>
    </main>
  );
}