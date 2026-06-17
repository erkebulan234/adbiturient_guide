import React from 'react';
import { useCompare } from '../context/CompareContext';

export default function CompareButton({ program, style = {} }) {
  const compare = useCompare();
  const items = compare?.items ?? [];
  const toggle = compare?.toggle ?? (() => {});

  const active   = items.some(p => p.id === program.id);
  const disabled = items.length >= 3 && !active;

  return (
    <button
      onClick={() => toggle(program)}
      disabled={disabled}
      title={
        disabled ? 'Максимум 3 программы для сравнения' :
        active   ? 'Убрать из сравнения' :
                   'Добавить в сравнение'
      }
      style={{
        background: active ? '#2563eb' : 'none',
        border: `2px solid ${active ? '#2563eb' : disabled ? '#e5e7eb' : '#cbd5e1'}`,
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 700,
        color: active ? '#fff' : disabled ? '#9ca3af' : '#64748b',
        transition: 'all 0.15s',
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
    >
      {active ? '✓ В сравнении' : 'Сравнить'}
    </button>
  );
}