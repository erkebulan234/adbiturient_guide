import React from 'react';
import ProgramCardBase from './ProgramCardBase';

export default function FavoriteCard({ item, onRemove }) {
  return (
    <ProgramCardBase
      program={{ ...item, id: item.program_id }}
      actions={
        <button
          className="danger-button"
          onClick={() => onRemove(item.program_id)}
          style={{ whiteSpace: 'nowrap' }}
        >
          Убрать
        </button>
      }
    />
  );
}