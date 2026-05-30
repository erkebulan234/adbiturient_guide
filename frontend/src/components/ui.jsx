import React, { useEffect } from 'react';

export function Card({ as: Component = 'section', tone = 'default', className = '', children, ...props }) {
  return (
    <Component className={`panel ui-card ui-card-${tone} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  return <span className={`ui-badge ui-badge-${tone} ${className}`}>{children}</span>;
}

export function EmptyState({ eyebrow, title, description, action, className = '' }) {
  return (
    <section className={`empty-state panel ui-empty ${className}`}>
      {eyebrow && <p className="kicker">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action && <div className="actions">{action}</div>}
    </section>
  );
}

export function SkeletonLoader({ rows = 3, className = '' }) {
  return (
    <div className={`ui-skeleton-stack ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-row" key={index} />
      ))}
    </div>
  );
}

export function Modal({ open, title, description, children, footer, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="ui-modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="quiet-button" type="button" onClick={onClose} aria-label="Закрыть">
            Закрыть
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
        {footer && <footer className="ui-modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}

export function Toast({ tone = 'success', title, description, onClose }) {
  return (
    <div className={`ui-toast ui-toast-${tone}`} role="status" aria-live="polite">
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      {onClose && (
        <button className="quiet-button" type="button" onClick={onClose} aria-label="Закрыть уведомление">
          ×
        </button>
      )}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`ui-tabs ${className}`} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          className={tab.value === value ? 'active' : ''}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Tooltip({ label, children }) {
  return (
    <span className="ui-tooltip">
      {children}
      <span className="ui-tooltip-content" role="tooltip">{label}</span>
    </span>
  );
}
