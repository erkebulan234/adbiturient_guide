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
      className={`compare-button ${active ? 'is-active' : ''}`}
      style={style}
      aria-pressed={active}
    >
      {active ? '✓ В сравнении' : 'Сравнить'}
    </button>
  );
}