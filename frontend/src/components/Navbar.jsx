import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/profile" style={styles.logo}>Навигатор абитуриента</Link>

      <div style={styles.links}>
        <Link to="/profile">Анкета</Link>
        <Link to="/test">Тест</Link>
        <Link to="/results">Рекомендации</Link>
        <Link to="/institutions">Каталог</Link>
        {user?.role === 'admin' && <Link to="/admin">Админ</Link>}
        <button onClick={handleLogout} style={styles.logout}>Выйти</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    minHeight: 68,
    background: '#ffffff',
    borderBottom: '1px solid #e1e7ef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)'
  },
  logo: {
    fontWeight: 800,
    color: '#2563eb',
    fontSize: 18
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap'
  },
  logout: {
    border: 'none',
    background: '#ef4444',
    color: 'white',
    padding: '9px 13px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700
  }
};