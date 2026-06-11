import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/* ── Stage options ─────────────────────────────────────────────────── */
const STAGE_OPTIONS = [
  { value: 'processing',     label: 'Under Review'    },
  { value: 'high_signal',    label: 'Strong Match'    },
  { value: 'audit_required', label: 'Needs Attention' },
  { value: 'high_noise',     label: 'Poor Match'      },
  { value: 'rejected',       label: 'Declined'        },
];

const SCORE_OPTIONS = [
  { value: 'low',    label: 'High Confidence (0–30%)'   },
  { value: 'medium', label: 'Moderate Confidence (31–69%)' },
  { value: 'high',   label: 'Low Confidence (70–100%)'  },
];

/* ── Dropdown filter ───────────────────────────────────────────────── */
function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };

  const hasActive = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium"
        style={{
          background: hasActive ? 'var(--badge-blue-bg)' : 'var(--bg)',
          color: hasActive ? 'var(--badge-blue-text)' : 'var(--text-body)',
          boxShadow: hasActive ? 'none' : 'var(--btn-secondary-shadow)',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { if (!hasActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { if (!hasActive) e.currentTarget.style.background = 'var(--bg)'; }}
      >
        {label}
        {hasActive && (
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
            style={{ background: 'var(--badge-blue-text)', color: 'var(--badge-blue-bg)' }}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={11} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 rounded-lg py-1 z-20 min-w-[160px]"
          style={{ background: 'var(--bg)', boxShadow: 'var(--sh-modal)' }}
        >
          {options.map(opt => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                style={{
                  background: checked ? 'var(--bg-hover)' : 'transparent',
                  color: checked ? 'var(--text-primary)' : 'var(--text-body)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = checked ? 'var(--bg-hover)' : 'transparent'; }}
              >
                <span
                  className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: checked ? 'var(--text-primary)' : 'transparent',
                    boxShadow: checked ? 'none' : 'var(--sh-ring)',
                  }}
                >
                  {checked && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Active chip ───────────────────────────────────────────────────── */
function ActiveChip({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
      style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{ color: 'var(--badge-blue-text)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
      >
        <X size={10} />
      </button>
    </span>
  );
}

/* ── Toolbar ───────────────────────────────────────────────────────── */
export default function CandidatesToolbar({
  search, onSearch,
  stageFilter, onStageFilter,
  scoreFilter, onScoreFilter,
  totalShown, totalAll,
}) {
  const anyActive = stageFilter.length > 0 || scoreFilter.length > 0 || search;
  const clearAll  = () => { onSearch(''); onStageFilter([]); onScoreFilter([]); };

  /* Stage chip labels */
  const stageLabels = stageFilter.map(v => STAGE_OPTIONS.find(o => o.value === v)?.label ?? v);
  /* Score chip labels */
  const scoreLabels = scoreFilter.map(v => SCORE_OPTIONS.find(o => o.value === v)?.label ?? v);

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 — search + dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[320px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-placeholder)' }}
          />
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-8 pr-8 py-1.5 text-[13px]"
            style={{ width: '100%' }}
            id="candidates-search"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-placeholder)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <FilterDropdown
          label="Stage"
          options={STAGE_OPTIONS}
          selected={stageFilter}
          onChange={onStageFilter}
        />
        <FilterDropdown
          label="Score"
          options={SCORE_OPTIONS}
          selected={scoreFilter}
          onChange={onScoreFilter}
        />

        {/* Clear all */}
        {anyActive && (
          <button
            onClick={clearAll}
            className="text-[12px] px-2 py-1.5"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Clear all
          </button>
        )}

        {/* Results count */}
        <span className="ml-auto text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {totalShown === totalAll
            ? `${totalAll} candidate${totalAll !== 1 ? 's' : ''}`
            : `${totalShown} of ${totalAll}`}
        </span>
      </div>

      {/* Row 2 — active chips */}
      {(stageLabels.length > 0 || scoreLabels.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          {stageLabels.map((label, i) => (
            <ActiveChip
              key={`stage-${i}`}
              label={label}
              onRemove={() => onStageFilter(stageFilter.filter((_, j) => j !== i))}
            />
          ))}
          {scoreLabels.map((label, i) => (
            <ActiveChip
              key={`score-${i}`}
              label={label}
              onRemove={() => onScoreFilter(scoreFilter.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
