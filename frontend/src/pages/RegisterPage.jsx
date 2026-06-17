import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth.api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import GoogleAuthButton from '../components/GoogleAuthButton';
import Input from '../components/Input';
import logoMark from '../assets/navigator-logo-mark.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Некорректный email';
    if (!form.password) next.password = 'Введите пароль';
    else if (form.password.length < 6) next.password = 'Минимум 6 символов';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = validate();
    if (Object.keys(next).length) { setErrors(next); return; }

    setIsLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      setUser(data.user, data.token);
      showToast({ tone: 'success', title: 'Добро пожаловать!', description: 'Аккаунт создан. Заполните анкету.' });
      navigate('/profile');
    } catch (err) {
      const message = err.response?.data?.message || 'Не удалось создать аккаунт';
      showToast({ tone: 'danger', title: 'Ошибка регистрации', description: message });
      if (message.toLowerCase().includes('существует')) {
        setErrors({ email: 'Этот email уже зарегистрирован' });
      }
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

        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <Input
            label="Имя"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Например: Алия"
            hint="Необязательно"
            autoComplete="name"
            autoFocus
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            hint="Минимум 6 символов"
            autoComplete="new-password"
          />

          <Button type="submit" isLoading={isLoading} size="lg">
            Создать аккаунт
          </Button>
          
          <div style={{ margin: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            или
          </div>
          <GoogleAuthButton redirectTo="/profile" />
        </form>

        <p className="auth-switch">
          Уже есть аккаунт?{' '}
          <Link className="text-link" to="/login">Войти</Link>
        </p>
      </section>
    </main>
  );
}