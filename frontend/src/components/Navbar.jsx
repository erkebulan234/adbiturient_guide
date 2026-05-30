import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logoMark from '../assets/navigator-logo-mark.png';

const navItems = [
  { to: '/profile', label: 'Обзор' },
  { to: '/test', label: 'Тест' },
  { to: '/results', label: 'Рекомендации' },
  { to: '/institutions', label: 'Каталог' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

      <button className="quiet-button" type="button" onClick={handleLogout}>
        Выйти
      </button>
    </header>
  );
}
