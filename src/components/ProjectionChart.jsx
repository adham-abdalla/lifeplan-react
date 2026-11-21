import React from 'react';
import { money } from '../lib/finance.js';

// Simple, dependency-free SVG chart: savings balance vs total contributed, by age.
export default function ProjectionChart({ rows }) {
  const W = 640, H = 260, pad = { l: 64, r: 16, t: 16, b: 32 };
  if (rows.length < 2) return null;
  const maxY = Math.max(...rows.map(r => r.balance)) || 1;
  const x = i => pad.l + (i / (rows.length - 1)) * (W - pad.l - pad.r);
  const y = v => H - pad.b - (v / maxY) * (H - pad.t - pad.b);
  const line = key => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(' ');
  const area = `${line('balance')} L${x(rows.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * maxY);
  const ageStep = Math.max(1, Math.ceil((rows.length - 1) / 8));
  const final = rows[rows.length - 1];

  return (
    <figure className="mb-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-100" role="img"
        aria-label={`Projected savings grow to ${money(final.balance)} by age ${final.age}, of which ${money(final.contributed)} is contributions.`}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e5e7eb" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6b7280">{money(t / 1000)}k</text>
          </g>
        ))}
        {rows.map((r, i) => i % ageStep === 0 || i === rows.length - 1
          ? <text key={r.age} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#6b7280">{r.age}</text>
          : null)}
        <path d={area} fill="#ffd400" fillOpacity="0.25" />
        <path d={line('balance')} fill="none" stroke="#b38600" strokeWidth="2.5" />
        <path d={line('contributed')} fill="none" stroke="#004c6c" strokeWidth="2" strokeDasharray="6 4" />
      </svg>
      <figcaption className="small text-body-secondary d-flex gap-3 flex-wrap">
        <span><span className="legend-swatch" style={{ background: '#b38600' }} /> Projected balance</span>
        <span><span className="legend-swatch" style={{ background: '#004c6c' }} /> Total contributed</span>
        <span>Age on the horizontal axis</span>
      </figcaption>
    </figure>
  );
}
