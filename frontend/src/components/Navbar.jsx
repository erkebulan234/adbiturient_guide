import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import logoMark from '../assets/navigator-logo-mark.png';

const navItems = [
  { to: '/profile',      label: 'Обзор' },
  { to: '/test',         label: 'Тест' },
  { to: '/results',      label: 'Рекомендации' },
  { to: '/institutions', label: 'Каталог' },
  { to: '/favorites',    label: 'Избранное' },
  { to: '/compare',      label: 'Сравнение' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <NavLink to="/profile" className="brand" aria-label="Навигатор абитуриента">
        <span className="brand-mark has-logo" aria-hidden="true">
          <img className="brand-logo" src={logoMark} alt="" />
        </span>
        <span className="brand-text">
          <strong>Навигатор</strong>
          <small>для абитуриента</small>
        </span>
      </NavLink>

      <nav className="nav" aria-label="Основная навигация">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Админ
          </NavLink>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={toggle}
          className="quiet-button"
          type="button"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          style={{ fontSize: 16 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="quiet-button" type="button" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
}