import React, { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export default function ProjectComparison({ projects, onSelectProject }) {
  const barsRef  = useRef([]);
  const matchRef = useRef([]);

  const max = Math.max(...(projects?.map(p => p.total) ?? [1]), 1);

  useEffect(() => {
    const animate = (refs, delay = 0) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        el.style.width = '0%';
        el.style.transition = 'none';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = `width ${0.45 + i * 0.07}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
            el.style.width = el.dataset.target;
          });
        });
      });
    };
    animate(barsRef, 0);
    animate(matchRef, 80);
  }, [projects]);

  if (!projects) return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-40 shrink-0">
            <div className="h-3 w-28 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
          </div>
          <div className="flex-1 h-5 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
          <div className="w-12 h-3 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
        </div>
      ))}
    </div>
  );

  if (projects.length === 0) return (
    <p className="text-[13px] text-center py-8" style={{ color: 'var(--text-placeholder)' }}>
      No projects to compare yet
    </p>
  );

  return (
    <div className="flex flex-col gap-3">
      {projects.map((p, i) => {
        const totalPct = (p.total / max) * 100;
        const matchPct = p.total > 0 ? (p.strong_match / p.total) * 100 : 0;
        const matchRate = Math.round((p.match_rate ?? 0) * 100);

        return (
          <button
            key={p._id}
            onClick={() => onSelectProject?.(p)}
            className="flex items-center gap-4 w-full text-left group"
            style={{ background: 'none', border: 'none', cursor: onSelectProject ? 'pointer' : 'default', padding: 0 }}
          >

            <div className="w-40 shrink-0 min-w-0 text-right">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.1px' }}
              >
                {p.title}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {p.department}
              </p>
            </div>

            <div className="flex-1 relative" style={{ height: '28px' }}>

              <div
                className="absolute inset-y-0 left-0 rounded-md"
                style={{ background: 'var(--bg-hover)', width: '100%' }}
              />

              <div
                ref={el => {
                  barsRef.current[i] = el;
                  if (el) el.dataset.target = `${Math.max(totalPct, p.total > 0 ? 6 : 0)}%`;
                }}
                className="absolute inset-y-0 left-0 rounded-md"
                style={{
                  background: 'var(--text-placeholder)',
                  opacity: 0.35,
                  width: 0,
                }}
              />

              <div
                ref={el => {
                  matchRef.current[i] = el;
                  if (el) el.dataset.target = `${Math.max((matchPct / 100) * totalPct, p.strong_match > 0 ? 4 : 0)}%`;
                }}
                className="absolute inset-y-0 left-0 rounded-md"
                style={{
                  background: 'var(--badge-green-text)',
                  opacity: 0.8,
                  width: 0,
                }}
              />

              <div className="absolute inset-0 flex items-center px-2.5">
                <span
                  className="text-[11px] font-semibold tabular-nums"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {p.total}
                </span>
              </div>
            </div>

            <div className="w-16 shrink-0 flex items-center justify-end gap-1">
              <span
                className="text-[12px] font-semibold tabular-nums"
                style={{
                  color: matchRate >= 40 ? 'var(--badge-green-text)' : matchRate >= 20 ? 'var(--badge-blue-text)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {matchRate}%
              </span>
              {onSelectProject && (
                <ChevronRight
                  size={12}
                  style={{
                    color: 'var(--text-placeholder)',
                    transition: 'color 0.12s',
                  }}
                  className="group-hover:text-primary"
                />
              )}
            </div>
          </button>
        );
      })}

      <div className="flex items-center gap-4 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: 'var(--text-placeholder)', opacity: 0.35 }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total applicants</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: 'var(--badge-green-text)', opacity: 0.8 }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Strong matches</span>
        </div>
      </div>
    </div>
  );
}
