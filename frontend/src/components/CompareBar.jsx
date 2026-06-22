import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';

export default function CompareBar() {
  const compare = useCompare();
  const location = useLocation();
  const items = compare?.items ?? [];
  const clear = compare?.clear ?? (() => {});

  if (items.length === 0) return null;
  if (location.pathname === '/compare') return null;

  return (
    <div className="compare-bar">
      <span className="compare-bar-label">
        Сравнение: {items.length} из 3
      </span>

      <div className="compare-bar-chips">
        {items.map(item => (
          <span key={item.id} className="compare-bar-chip">
            {item.specialty_title || item.title || 'Программа'}
          </span>
        ))}
      </div>

      <div className="compare-bar-actions">
        <button onClick={() => clear()} className="compare-bar-clear" aria-label="Очистить сравнение">
          ✕
        </button>
        <Link to="/compare" className="compare-bar-cta">
          Сравнить →
        </Link>
      </div>
    </div>
  );
}