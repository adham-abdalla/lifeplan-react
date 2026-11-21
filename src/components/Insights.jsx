import React from 'react';

const ICON = { success: '✅', warning: '⚠️', danger: '⛔', info: '💡' };

export default function Insights({ items }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="insights-title" className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 id="insights-title" className="h5 card-title">Personalized insights</h2>
        <p className="small text-body-secondary">Generated from your numbers with transparent rules, so every tip says why it appears.</p>
        <ul className="list-unstyled mb-0" aria-live="polite">
          {items.map(i => (
            <li key={i.title} className={`alert alert-${i.level} py-2 mb-2`}>
              <strong><span aria-hidden="true">{ICON[i.level]} </span>{i.title}</strong>
              <div className="small">{i.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
