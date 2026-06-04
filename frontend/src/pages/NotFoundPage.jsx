import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="page">
      <section className="empty-state panel" style={{ margin: '60px auto', textAlign: 'center', alignItems: 'center' }}>
        <p className="kicker">Ошибка 404</p>
        <h1 style={{ fontSize: 'clamp(60px, 10vw, 120px)', margin: '0 0 16px' }}>404</h1>
        <h2>Страница не найдена</h2>
        <p>Возможно, ссылка устарела или страница была удалена.</p>
        <div className="actions" style={{ marginTop: 24 }}>
          <Link className="primary-button" to="/">На главную</Link>
          <Link className="secondary-button" to="/profile">В профиль</Link>
        </div>
      </section>
    </main>
  );
}