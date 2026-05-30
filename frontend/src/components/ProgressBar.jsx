import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  className = ''
}) {
  const percent = Math.max(0, Math.min(100, Math.round((Number(value) / Number(max || 100)) * 100)));

  return (
    <div className={`ui-progress ${className}`}>
      {(label || showValue) && (
        <div className="ui-progress-meta">
          {label && <span>{label}</span>}
          {showValue && <strong>{percent}%</strong>}
        </div>
      )}
      <div className="progress-line" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
