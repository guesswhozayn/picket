import React, { useMemo } from 'react';

const SEGMENTS = [
  { key: 'high',     label: 'High Confidence',     color: 'var(--badge-green-text)', bg: 'var(--badge-green-bg)' },
  { key: 'moderate', label: 'Moderate Confidence',  color: '#0068d6',                 bg: 'var(--badge-blue-bg)' },
  { key: 'low',      label: 'Low Confidence',       color: 'var(--badge-red-text)',   bg: 'var(--badge-red-bg)' },
];

const R = 52;        // circle radius
const STROKE = 14;   // stroke width
const CIRC = 2 * Math.PI * R;

export default function ConfidenceDonut({ confidence }) {
  const total = (confidence?.high ?? 0) + (confidence?.moderate ?? 0) + (confidence?.low ?? 0);

  const arcs = useMemo(() => {
    if (!total) return [];
    const counts = [confidence.high, confidence.moderate, confidence.low];
    let offset = 0;
    return counts.map(count => {
      const pct  = count / total;
      const dash = pct * CIRC;
      const gap  = CIRC - dash;
      const arc  = { dasharray: `${dash} ${gap}`, dashoffset: -offset * CIRC };
      offset += pct;
      return arc;
    });
  }, [confidence, total]);

  const dominant = useMemo(() => {
    if (!confidence || !total) return null;
    const entries = [
      { key: 'high', count: confidence.high },
      { key: 'moderate', count: confidence.moderate },
      { key: 'low', count: confidence.low },
    ];
    return entries.sort((a, b) => b.count - a.count)[0];
  }, [confidence, total]);

  const dominantMeta = SEGMENTS.find(s => s.key === dominant?.key);
  const dominantPct  = dominant && total ? Math.round((dominant.count / total) * 100) : 0;

  const SIZE = (R + STROKE) * 2 + 4;
  const CENTER = SIZE / 2;

  if (!confidence) return (
    <div className="flex items-center gap-6">
      <div className="w-32 h-32 rounded-full animate-pulse shrink-0" style={{ background: 'var(--bg-hover)' }} />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--bg-hover)' }} />
            <div className="w-32 h-3 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Background track */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth={STROKE}
          />

          {/* Segments */}
          {total === 0 ? (
            <circle cx={CENTER} cy={CENTER} r={R} fill="none"
              stroke="var(--bg-hover)" strokeWidth={STROKE} />
          ) : (
            arcs.map((arc, i) => (
              <circle
                key={i}
                cx={CENTER} cy={CENTER} r={R}
                fill="none"
                stroke={SEGMENTS[i].color}
                strokeWidth={STROKE}
                strokeDasharray={arc.dasharray}
                strokeDashoffset={arc.dashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
              />
            ))
          )}
        </svg>

        {/* Centre label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <p
            className="text-[22px] font-semibold leading-none tabular-nums"
            style={{ letterSpacing: '-1px', color: dominantMeta?.color ?? 'var(--text-primary)' }}
          >
            {dominantPct}%
          </p>
          <p className="text-[9px] font-medium uppercase mt-1" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.3px', color: 'var(--text-muted)', maxWidth: '60px', lineHeight: 1.2 }}>
            {dominantMeta?.label ?? 'No data'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {SEGMENTS.map(seg => {
          const count = confidence?.[seg.key] ?? 0;
          const pct   = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={seg.key} className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: seg.color }}
              />
              <div>
                <p className="text-[12px] font-medium" style={{ color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                  {seg.label}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {count} applicant{count !== 1 ? 's' : ''} · {pct}%
                </p>
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <p className="text-[12px]" style={{ color: 'var(--text-placeholder)' }}>No data yet</p>
        )}
      </div>
    </div>
  );
}
