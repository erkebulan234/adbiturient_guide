import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { Badge } from '../components/ui';

function formatMoney(value) {
  if (!value) return '—';
  return `${Number(value).toLocaleString('ru-RU')} тг/год`;
}

function formatArray(value) {
  if (!Array.isArray(value) || value.length === 0) return '—';
  return value.join(', ');
}

const ROWS = [
  { label: 'Специальность',      key: item => item.specialty_title || item.title || '—' },
  { label: 'Профессия',          key: item => item.profession || '—' },
  { label: 'Учебное заведение',  key: item => item.institution_name || '—' },
  { label: 'Тип',                key: item => item.institution_type === 'college' ? 'Колледж' : 'Университет' },
  { label: 'Город',              key: item => item.institution_city || '—' },
  { label: 'Стоимость',          key: item => formatMoney(item.tuition_fee) },
  { label: 'Срок обучения',      key: item => item.duration_years ? `${item.duration_years} года` : '—' },
  { label: 'Язык обучения',      key: item => item.study_language || '—' },
  { label: 'Форма обучения',     key: item => item.study_form || '—' },
  { label: 'Мин. балл ЕНТ',     key: item => item.min_score || '—' },
  { label: 'Грант',              key: item => item.has_grant ? '✓ Есть' : '✗ Нет', highlight: item => item.has_grant },
  { label: 'Средняя зарплата',   key: item => item.average_salary || '—' },
  { label: 'Востребованность',   key: item => item.demand_level || '—' },
  { label: 'Нужные предметы',    key: item => formatArray(item.required_subjects) },
  { label: 'Навыки',             key: item => formatArray(item.required_skills) },
];

export default function ComparePage() {
  const { items, toggle, clear } = useCompare();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="page">
        <section className="empty-state panel" style={{ margin: '60px auto', textAlign: 'center', alignItems: 'center' }}>
          <p className="kicker">Сравнение</p>
          <h2>Нет программ для сравнения</h2>
          <p>Добавьте 2–3 программы через кнопку "⇄ Сравнить" в каталоге или рекомендациях.</p>
          <div className="actions" style={{ marginTop: 24, justifyContent: 'center' }}>
            <Link className="primary-button" to="/institutions">Открыть каталог</Link>
            <Link className="secondary-button" to="/results">Рекомендации</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="results-header">
        <div>
          <p className="kicker">Сравнение программ</p>
          <h1>Выбранные программы рядом</h1>
          <p className="lead">Сравните условия поступления, стоимость и требования.</p>
        </div>
        <div className="results-actions">
          <button className="secondary-button" onClick={clear}>Очистить</button>
          <Link className="secondary-button" to="/institutions">+ Добавить</Link>
        </div>
      </section>

      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, color: '#64748b', fontWeight: 700, width: 180, borderBottom: '1px solid #e5e7eb' }}>
                Параметр
              </th>
              {items.map(item => (
                <th key={item.id} style={{ padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', minWidth: 220 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <Badge tone="neutral">{item.institution_type === 'college' ? 'Колледж' : 'Университет'}</Badge>
                      <button
                        onClick={() => toggle(item)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, padding: 0 }}
                        title="Убрать из сравнения"
                      >✕</button>
                    </div>
                    <strong style={{ fontSize: 15 }}>{item.specialty_title || item.title}</strong>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{item.institution_name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ROWS.map((row, rowIndex) => (
              <tr key={row.label} style={{ background: rowIndex % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>
                  {row.label}
                </td>
                {items.map(item => {
                  const value     = row.key(item);
                  const highlight = row.highlight?.(item);
                  return (
                    <td key={item.id} style={{
                      padding: '14px 20px',
                      fontSize: 14,
                      borderBottom: '1px solid #f1f5f9',
                      color: highlight ? '#16a34a' : '#142033',
                      fontWeight: highlight ? 700 : 400
                    }}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.some(item => item.institution_website) && (
        <section style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {items.map(item => item.institution_website && (
            <a
              key={item.id}
              className="secondary-button"
              href={item.institution_website}
              target="_blank"
              rel="noreferrer"
            >
              {item.institution_name} →
            </a>
          ))}
        </section>
      )}
    </main>
  );
}