import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/auth.api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import GoogleAuthButton from '../components/GoogleAuthButton';
import logoMark from '../assets/navigator-logo-mark.png';

export default function LoginPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { setUser }    = useAuth();
  const { showToast }  = useToast();
  const redirectTo = location.state?.from || '/profile';

  const [form,      setForm]      = useState({ email: '', password: '' });
  const [errors,    setErrors]    = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.email)    next.email    = 'Введите email';
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
      setUser(data.user, data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      showToast({ tone: 'danger', title: 'Ошибка входа',
        description: err.response?.data?.message || 'Не удалось войти' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">

      {/* ── Левая колонка — копи ── */}
      <section className="auth-copy">
        <Link to="/" className="brand" aria-label="Навигатор абитуриента">
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
            Войдите, чтобы открыть анкету, результаты теста
            и персональные рекомендации.
          </p>
        </div>

        {/* Фичи снизу */}
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            ['🎯', 'Персональный подбор', 'на основе интересов и балла ЕНТ'],
            ['📋', 'Сравнение программ',  'колледжи и университеты Казахстана'],
            ['✅', 'Объяснимые рекомендации', 'понятная логика каждого варианта'],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '12px 14px', borderRadius: 14,
              border: '1px solid var(--line)', background: 'var(--paper-soft)'
            }}>
              <span style={{ fontSize: 18, lineHeight: 1.4 }}>{icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: 14, marginBottom: 2 }}>{title}</strong>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Правая колонка — форма ── */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(20px, 3vw, 48px) 0', minWidth: 0,
      }}>
        <div className="auth-card panel" style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ marginBottom: 6 }}>Вход</h2>
          <p style={{ marginBottom: 0 }}>
            Используйте email и пароль, указанные при регистрации.
          </p>

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
            <div style={{ margin: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              или
            </div>
            <GoogleAuthButton redirectTo={redirectTo} />
          </form>

          <p className="auth-switch">
            Нет аккаунта?{' '}
            <Link className="text-link" to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </section>
    </main>
  );
}