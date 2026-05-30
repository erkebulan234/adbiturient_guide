import React from 'react';

export default function Spinner({ label = 'Загрузка...', size = 'md', className = '' }) {
  return (
    <div className={`ui-spinner-wrap ${className}`} role="status" aria-live="polite">
      <span className={`ui-spinner ui-spinner-${size}`} aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  );
}

export function Loader({ title = 'Загружаем данные', description = 'Пожалуйста, подождите несколько секунд.' }) {
  return (
    <section className="panel ui-loader">
      <Spinner label="" />
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
