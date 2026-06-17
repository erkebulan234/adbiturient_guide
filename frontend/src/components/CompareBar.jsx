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
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e293b',
      color: '#fff',
      borderRadius: 16,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 100,
      maxWidth: '90vw',
      flexWrap: 'wrap'
    }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>
        Сравнение: {items.length} из 3
      </span>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {items.map(item => (
          <span key={item.id} style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 13,
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {item.specialty_title || item.title || 'Программа'}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        <button
          onClick={() => clear()}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            padding: '8px 12px',
            fontSize: 14
          }}
        >
          ✕
        </button>
        <Link
          to="/compare"
          style={{
            background: '#2563eb',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none'
          }}
        >
          Сравнить →
        </Link>
      </div>
    </div>
  );
}