  import React, { useEffect, useRef } from 'react';

const STEPS = [
  { key: 'total',           label: 'Received',          color: '#0068d6', bg: 'var(--badge-blue-bg)',    text: 'var(--badge-blue-text)' },
  { key: 'screened',        label: 'Screened by AI',    color: '#7c3aed', bg: 'var(--badge-blue-bg)',    text: 'var(--badge-blue-text)' },
  { key: 'needs_attention', label: 'Needs Attention',   color: '#a81d78', bg: 'var(--badge-pink-bg)',    text: 'var(--badge-pink-text)' },
  { key: 'strong_match',    label: 'Strong Match',      color: '#1a7f4b', bg: 'var(--badge-green-bg)',   text: 'var(--badge-green-text)' },
];

const STEP_COLORS = [
  'var(--badge-blue-text)',
  '#7c3aed',
  'var(--badge-pink-text)',
  'var(--badge-green-text)',
];

export default function FunnelChart({ summary }) {
  const barsRef = useRef([]);

  const { values, max } = React.useMemo(() => {
    const screened = (summary?.strong_match ?? 0) + (summary?.needs_attention ?? 0) + (summary?.poor_match ?? 0);
    const vals = [
      summary?.total          ?? 0,
      screened,
      summary?.needs_attention ?? 0,
      summary?.strong_match    ?? 0,
    ];
    return { values: vals, max: vals[0] || 1 };
  }, [summary]);

  useEffect(() => {
    barsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.width = '0%';
      el.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `width ${0.4 + i * 0.12}s cubic-bezier(0.4, 0, 0.2, 1)`;
          el.style.width = `${Math.max((values[i] / max) * 100, values[i] > 0 ? 4 : 0)}%`;
        });
      });
    });
  }, [values, max]);

  if (!summary) return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-28 shrink-0" />
          <div
            className="h-9 rounded-lg animate-pulse"
            style={{ width: `${80 - i * 15}%`, background: 'var(--bg-hover)' }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {STEPS.map((step, i) => {
        const count = values[i];
        const pct   = max > 0 ? Math.round((count / max) * 100) : 0;
        const drop  = i > 0 && values[0] > 0 ? Math.round((count / values[0]) * 100) : null;

        return (
          <div key={step.key} className="flex items-center gap-4">

            <div className="w-32 shrink-0 text-right">
              <span
                className="text-[11px] font-semibold uppercase"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.3px', color: 'var(--text-muted)' }}
              >
                {step.label}
              </span>
            </div>

            <div className="flex-1 relative" style={{ height: '36px' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-lg"
                style={{ background: 'var(--bg-hover)', width: '100%' }}
              />
              <div
                ref={el => { barsRef.current[i] = el; }}
                className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-3"
                style={{
                  background: STEP_COLORS[i],
                  opacity: 0.85,
                  minWidth: count > 0 ? '40px' : 0,
                  width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                }}
              >
                <span
                  className="text-[12px] font-bold tabular-nums"
                  style={{ color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1 }}
                >
                  {count}
                </span>
              </div>
            </div>

            <div className="w-14 shrink-0 text-right">
              {drop !== null ? (
                <span
                  className="text-[11px] font-medium tabular-nums"
                  style={{ color: drop >= 50 ? 'var(--badge-green-text)' : 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}
                >
                  {drop}%
                </span>
              ) : (
                <span className="text-[11px]" style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}>-</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
