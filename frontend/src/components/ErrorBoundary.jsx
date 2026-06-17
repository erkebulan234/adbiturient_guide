import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="page">
        <section className="empty-state panel" style={{ margin: '60px auto', textAlign: 'center', alignItems: 'center' }}>
          <p className="kicker">Что-то пошло не так</p>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 80px)', margin: '0 0 16px' }}>:(</h1>
          <h2>Произошла непредвиденная ошибка</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 480 }}>
            Страница упала, но остальное приложение работает.
            Попробуйте вернуться назад или перезагрузить страницу.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: 20, padding: '12px 16px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 10,
              fontSize: 12, color: '#b91c1c', textAlign: 'left',
              maxWidth: 600, overflowX: 'auto', whiteSpace: 'pre-wrap'
            }}>
              {this.state.error.toString()}
            </pre>
          )}

          <div className="actions" style={{ marginTop: 24, justifyContent: 'center' }}>
            <button
              className="primary-button"
              onClick={() => this.handleReset()}
            >
              Попробовать снова
            </button>
            <Link className="secondary-button" to="/">На главную</Link>
          </div>
        </section>
      </main>
    );
  }
}
