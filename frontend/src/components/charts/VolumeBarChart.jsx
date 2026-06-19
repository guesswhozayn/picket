import React, { useEffect, useRef, useMemo } from 'react';

const CHART_HEIGHT = 120;

export default function VolumeBarChart({ volumeByDay, days }) {
  const barsRef = useRef([]);

  const filled = useMemo(() => {
    if (!volumeByDay?.length) return [];

    const map = {};
    volumeByDay.forEach(({ date, count }) => { map[date] = count; });

    const result = [];
    const now = new Date();
    for (let i = Number(days) - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: map[key] ?? 0 });
    }
    return result;
  }, [volumeByDay, days]);

  const max = useMemo(() => Math.max(...filled.map(d => d.count), 1), [filled]);

  useEffect(() => {
    barsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.transform = 'scaleY(0)';
      el.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `transform ${0.3 + i * 0.015}s cubic-bezier(0.4, 0, 0.2, 1)`;
          el.style.transform  = 'scaleY(1)';
        });
      });
    });
  }, [filled]);

  if (!volumeByDay) return (
    <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm animate-pulse"
          style={{
            height: `${20 + ((i * 17) % 61)}%`,
            background: 'var(--bg-hover)',
          }}
        />
      ))}
    </div>
  );

  if (filled.length === 0 || max <= 1) return (
    <div
      className="flex items-center justify-center text-[12px]"
      style={{ height: CHART_HEIGHT, color: 'var(--text-placeholder)' }}
    >
      No applications in this period
    </div>
  );

  const labelEvery = filled.length <= 14 ? 2 : filled.length <= 30 ? 5 : 10;

  return (
    <div className="flex flex-col gap-1">

      <div className="flex items-end gap-0.5" style={{ height: CHART_HEIGHT }}>
        {filled.map((day, i) => {
          const heightPct = (day.count / max) * 100;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end group relative"
              style={{ height: '100%' }}
            >

              {day.count > 0 && (
                <div
                  className="absolute bottom-full mb-1.5 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10"
                  style={{
                    background: 'var(--text-primary)',
                    color: 'var(--bg)',
                    fontFamily: 'var(--font-mono)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    transition: 'opacity 0.1s ease',
                  }}
                >
                  {day.count}
                </div>
              )}

              <div
                ref={el => { barsRef.current[i] = el; }}
                className="w-full rounded-t-sm"
                style={{
                  height:           `${Math.max(heightPct, day.count > 0 ? 3 : 0)}%`,
                  background:       day.count > 0 ? 'var(--badge-blue-text)' : 'var(--bg-hover)',
                  transformOrigin:  'bottom',
                  transform:        'scaleY(0)',
                  opacity:          day.count > 0 ? 0.85 : 0.3,
                  minHeight:        day.count > 0 ? '3px' : '1px',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-0.5">
        {filled.map((day, i) => {
          const show = i % labelEvery === 0;
          const d    = new Date(day.date + 'T00:00:00');
          const lbl  = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div key={day.date} className="flex-1 text-center overflow-hidden">
              {show ? (
                <span
                  className="text-[9px]"
                  style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}
                >
                  {lbl}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
