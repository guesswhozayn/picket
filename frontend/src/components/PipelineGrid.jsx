import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, User, Clock, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ScoreBar, AgentLogDrawer, STAGES } from './PipelineShared';

function SortButton({ label, colKey, sortKey, sortDir, onSort }) {
  const active = sortKey === colKey;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(colKey)}
      className="flex items-center gap-1 text-[11px] font-medium uppercase"
      style={{
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.4px',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-muted)'; }}
    >
      {label}
      <Icon size={10} />
    </button>
  );
}

function CandidateRow({ candidate, index }) {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round(candidate.synthetic_probability * 100);
  const hasLog = (candidate.agent_audit_trail && candidate.agent_audit_trail.length > 0) || candidate.pow_data;

  const stage = STAGES.find(s => s.id === candidate.pipeline_status) || STAGES[0];

  const submittedAt = candidate.submitted_at
    ? new Date(candidate.submitted_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '-';

  return (
    <>
      <tr
        onClick={() => hasLog && setExpanded(e => !e)}
        style={{
          cursor: hasLog ? 'pointer' : 'default',
          background: expanded ? 'var(--bg-surface)' : 'var(--bg)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => {
          if (!expanded) e.currentTarget.style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = expanded ? 'var(--bg-surface)' : 'var(--bg)';
        }}
      >
        <td className="pl-4 pr-2 py-3 w-8 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-center w-5 h-5">
            {hasLog ? (
              <span style={{ color: 'var(--text-placeholder)' }}>
                {expanded
                  ? <ChevronDown size={13} />
                  : <ChevronRight size={13} />}
              </span>
            ) : (
              <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
              style={{
                background: stage.accentBg,
                color: stage.accentText,
                boxShadow: 'var(--sh-ring-lt)',
              }}
            >
              {candidate.name?.charAt(0)?.toUpperCase() ?? <User size={12} />}
            </div>
            <div className="min-w-0">
              <p
                className="text-[13px] font-semibold truncate"
                style={{ letterSpacing: '-0.2px', color: 'var(--text-primary)' }}
              >
                {candidate.name}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {candidate.email}
              </p>
            </div>
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] hidden sm:table-cell">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ background: stage.accentBg, color: stage.accentText }}
            >
              {stage.label}
            </span>
          </div>
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] hidden sm:table-cell">
          <ScoreBar score={score} />
        </td>

        <td
          className="px-4 py-3 border-b border-[var(--border-color)] hidden md:table-cell text-[12px]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {submittedAt}
        </td>

        <td className="px-4 py-3 border-b border-[var(--border-color)] hidden lg:table-cell">
          {hasLog ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-text)' }}
            >
              <Clock size={10} />
              {candidate.agent_audit_trail.length}
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: 'var(--text-placeholder)' }}>-</span>
          )}
        </td>

        <td className="pr-4 py-3 border-b border-[var(--border-color)] text-right w-6">
          {hasLog && (
            <span style={{ color: 'var(--text-placeholder)' }}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          )}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: 0 }}>
            <AgentLogDrawer candidate={candidate} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function PipelineGrid({ candidates }) {
  const [sortKey, setSortKey] = useState('score');
  const [sortDir, setSortDir] = useState('asc');
  const [filterStage, setFilterStage] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filteredCandidates = filterStage
    ? candidates.filter(c => c.pipeline_status === filterStage)
    : candidates;

  const sorted = [...filteredCandidates].sort((a, b) => {
    let av, bv;
    if (sortKey === 'score') {
      av = a.synthetic_probability;
      bv = b.synthetic_probability;
    } else if (sortKey === 'date') {
      av = new Date(a.submitted_at ?? 0);
      bv = new Date(b.submitted_at ?? 0);
    } else {
      av = a.name ?? '';
      bv = b.name ?? '';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Metric Cards Header */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setFilterStage(null)}
          className={`shrink-0 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
            filterStage === null
              ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)]'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          All Candidates ({candidates.length})
        </button>
        {STAGES.map(stage => {
          const count = candidates.filter(c => c.pipeline_status === stage.id).length;
          const active = filterStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setFilterStage(stage.id)}
              className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all"
              style={{
                background: active ? stage.accentBg : 'var(--bg-surface)',
                borderColor: active ? stage.accent : 'var(--border-color)',
                color: active ? stage.accentText : 'var(--text-muted)',
              }}
            >
              <stage.Icon size={14} className={stage.animate ? 'animate-pulse' : ''} />
              <span className="text-xs font-semibold">{stage.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/50">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Unified Table */}
      <div className="rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg)] shadow-sm">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[13px] text-[var(--text-muted)]">
            <span className="text-2xl mb-2">🔍</span>
            No candidates match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
                  <th className="pl-4 pr-2 py-3 w-8" />
                  <th className="px-4 py-3 text-left">
                    <SortButton label="Candidate" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    <span className="text-[11px] font-medium uppercase text-[var(--text-muted)] font-mono tracking-widest">
                      Stage
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell" title="Likelihood that this profile is synthetically or AI-generated (lower is safer)">
                    <SortButton label="AI Risk" colKey="score" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    <SortButton label="Submitted" colKey="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">
                    <span className="text-[11px] font-medium uppercase text-[var(--text-muted)] font-mono tracking-widest">
                      Review Log
                    </span>
                  </th>
                  <th className="pr-4 py-3 w-6" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((candidate, i) => (
                  <CandidateRow key={candidate._id} candidate={candidate} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
