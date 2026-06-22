import React from 'react';
import { Modal } from '../components/ui';

// ── Модал подтверждения удаления ─────────────────────────────
export default function DeleteModal({ item, onConfirm, onCancel, isDeleting = false }) {
  return (
    <Modal
      open={Boolean(item)}
      onClose={onCancel}
      title="Удалить запись?"
      footer={
        <>
          <button className="secondary-button" onClick={onCancel} disabled={isDeleting}>
            Отмена
          </button>
          <button className="danger-button" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Удаляем…' : 'Удалить'}
          </button>
        </>
      }
    >
      <div className="delete-modal-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <p>
        <strong style={{ color: 'var(--text)' }}>{item?.name || item?.title}</strong> будет удалено безвозвратно.
      </p>
    </Modal>
  );
}