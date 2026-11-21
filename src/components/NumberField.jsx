import React from 'react';

// Labelled number input with optional prefix/suffix and an error message.
export default function NumberField({ id, label, value, onChange, prefix, suffix, step = 1, min, max, error, help }) {
  const describedBy = [error && `${id}-error`, help && `${id}-help`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold small mb-1">{label}</label>
      <div className="input-group input-group-sm">
        {prefix && <span className="input-group-text">{prefix}</span>}
        <input
          id={id}
          type="number"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          max={max}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={e => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
        />
        {suffix && <span className="input-group-text">{suffix}</span>}
        {error && <div id={`${id}-error`} className="invalid-feedback">{error}</div>}
      </div>
      {help && <div id={`${id}-help`} className="form-text">{help}</div>}
    </div>
  );
}
