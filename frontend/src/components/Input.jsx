import React from 'react';

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`ui-field ${error ? 'has-error' : ''} ${className}`}>
      {label && <span className="ui-field-label">{label}</span>}
      {children}
      {hint && !error && <span className="ui-field-hint">{hint}</span>}
      {error && <span className="ui-field-error">{error}</span>}
    </label>
  );
}

export default function Input({
  label,
  hint,
  error,
  className = '',
  ...props
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <input className={`input ui-control ${className}`} aria-invalid={Boolean(error)} {...props} />
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  className = '',
  children,
  ...props
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <select className={`select ui-control ${className}`} aria-invalid={Boolean(error)} {...props}>
        {children}
      </select>
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className = '',
  ...props
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <textarea className={`textarea ui-control ${className}`} aria-invalid={Boolean(error)} {...props} />
    </Field>
  );
}
