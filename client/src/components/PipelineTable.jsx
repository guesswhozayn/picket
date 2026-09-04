import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  Activity, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
  Clock, User,
} from 'lucide-react';

const fetchCandidates = async (projectId) => {
  const url = projectId
    ? `/api/candidates?projectId=${projectId}`
    : '/api/candidates';
  const { data } = await api.get(url);
  return data;
};

const STAGES = [
  {
    id: 'processing',
    label: 'Under Review',
    accent: '#0068d6',
    accentBg: 'var(--badge-blue-bg)',
    accentText: 'var(--badge-blue-text)',
    Icon: Activity,
    animate: true,
  },
  {
    id: 'high_signal',
    label: 'Strong Match',
    accent: '#1a7f4b',
    accentBg: 'var(--badge-green-bg)',
    accentText: 'var(--badge-green-text)',
    Icon: CheckCircle,
    animate: false,
  },
  {
    id: 'audit_required',
    label: 'Needs Attention',
    accent: '#a81d78',
    accentBg: 'var(--badge-pink-bg)',
    accentText: 'var(--badge-pink-text)',
    Icon: AlertTriangle,
    animate: false,
  },
  {
    id: 'high_noise',
    label: 'Poor Match',
    accent: '#c53030',
    accentBg: 'var(--badge-red-bg)',
    accentText: 'var(--badge-red-text)',
    Icon: AlertTriangle,
    animate: false,
  },
  {
    id: 'rejected',
    label: 'Declined',
    accent: 'var(--text-muted)',
    accentBg: 'var(--badge-neutral-bg)',
    accentText: 'var(--badge-neutral-text)',
    Icon: XCircle,
    animate: false,
  },
];

function ScorePill({ score }) {
  const bgVar   = score < 30 ? '--badge-green-bg'  : score < 70 ? '--badge-blue-bg'  : '--badge-red-bg';
  const textVar = score < 30 ? '--badge-green-text' : score < 70 ? '--badge-blue-text' : '--badge-red-text';
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
      style={{
        background: `var(${bgVar})`,
        color: `var(${textVar})`,
        minWidth: '44px',
        letterSpacing: '-0.2px',
      }}
    >
      {score}%
    </span>
  );
}

/* ── Score bar ──────────────────────────────────────────────────────── */
function ScoreBar({ score }) {
  const color = score < 30 ? 'var(--badge-green-text)' : score < 70 ? '#0068d6' : 'var(--badge-red-text)';
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1 rounded-full flex-1"
        style={{ background: 'var(--bg-hover)', maxWidth: '80px', minWidth: '48px' }}
      >
        <div
          className="h-1 rounded-full"
          style={{
            width: `${score}%`,
            background: color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <ScorePill score={score} />
    </div>
  );
}

/* ── Agent log drawer (inline row expansion) ─────────────────────────── */
function AgentLogDrawer({ candidate }) {
  const trail = candidate.agent_audit_trail || [];
  const pow = candidate.pow_data;

  return (
    <div
      className="px-6 py-4 space-y-4"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
      }}
    >

      {pow && (
        <div className="p-4 rounded-lg border border-[var(--bg-hover)] bg-[var(--bg)] flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
              Verification Challenge
            </span>
            {pow.completed ? (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                pow.score >= 80 ? 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]' : 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]'
              }`}>
                Score: {pow.score}%
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]">
                Link Emailed (Pending)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1 text-[12px]">
            <div>
              <span className="text-[var(--text-placeholder)]">Assessment Type:</span> <strong className="capitalize">{pow.challenge_type?.replace('_', ' ') || 'Logic'}</strong>
            </div>
            <div>
              <span className="text-[var(--text-placeholder)]">Completion Time:</span> <strong>{pow.completed ? `${(pow.time_taken / 1000).toFixed(1)}s` : 'N/A'}</strong>
            </div>
            <div>
              <span className="text-[var(--text-placeholder)]">Activity Events:</span> <strong>{pow.completed ? `${pow.interaction_logs?.length || 0} events` : 'N/A'}</strong>
            </div>
          </div>

          {pow.completed && pow.interaction_logs && pow.interaction_logs.length > 0 && (
            <div className="mt-2 text-[11px] text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-placeholder)]">Integrity Verdict: </span>
              {pow.interaction_logs.some(l => l.event === 'paste_detected') ? (
                <span className="text-[var(--badge-red-text)] font-semibold">⚠️ Flagged: Paste event detected (Answer was not typed manually).</span>
              ) : (
                <span className="text-[var(--badge-green-text)]">✓ Verified: Natural keystroke telemetry pattern detected.</span>
              )}
            </div>
          )}
        </div>
      )}

      {trail.length > 0 && (
        <div>
          <p
            className="mono-label mb-2"
            style={{ color: 'var(--text-placeholder)' }}
          >
            Agent Audit Trail - {trail.length} entries
          </p>
          <div className="grid gap-2">
            {trail.map((log, i) => (
              <div
                key={i}
                className="flex gap-3 items-start rounded-md px-3 py-2"
                style={{ background: 'var(--bg)', boxShadow: 'var(--sh-ring)' }}
              >
                <span
                  className="text-[10px] font-semibold uppercase rounded px-1.5 py-0.5 mt-0.5 shrink-0"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--badge-neutral-bg)',
                    color: 'var(--badge-neutral-text)',
                    letterSpacing: '0.4px',
                  }}
                >
                  {log.agent_name}
                </span>
                <p className="text-[12px] leading-relaxed flex-1" style={{ color: 'var(--text-body)' }}>
                  {log.action}
                </p>
                <span
                  className="text-[10px] shrink-0 mt-0.5"
                  style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}
                >
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Candidate table row ────────────────────────────────────────────── */
function CandidateRow({ candidate, stage, index }) {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round(candidate.synthetic_probability * 100);
  const hasLog = (candidate.agent_audit_trail && candidate.agent_audit_trail.length > 0) || candidate.pow_data;

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

        <td className="pl-4 pr-2 py-3 w-8">
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

        <td className="px-4 py-3">
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

        <td className="px-4 py-3 hidden sm:table-cell">
          <ScoreBar score={score} />
        </td>

        <td
          className="px-4 py-3 hidden md:table-cell text-[12px]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {submittedAt}
        </td>

        <td className="px-4 py-3 hidden lg:table-cell">
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

        <td className="pr-4 py-3 text-right w-6">
          {hasLog && (
            <span style={{ color: 'var(--text-placeholder)' }}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          )}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <AgentLogDrawer candidate={candidate} />
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Sort button ────────────────────────────────────────────────────── */
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

/* ── Stage section ─────────────────────────────────────────────────── */
function StageSection({ stage, candidates, sortKey, sortDir, onSort }) {
  const [collapsed, setCollapsed] = useState(false);
  const { Icon, animate } = stage;

  const sorted = [...candidates].sort((a, b) => {
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
    <div
      className="rounded-lg overflow-hidden"
      style={{ boxShadow: 'var(--sh-card)' }}
    >

      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{
          background: stage.accentBg,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            size={13}
            className={animate ? 'animate-pulse' : ''}
            style={{ color: stage.accentText }}
          />
          <span
            className="text-[11px] font-semibold uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.5px',
              color: stage.accentText,
            }}
          >
            {stage.label}
          </span>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-text)' }}
          >
            {candidates.length}
          </span>
        </div>
        <span style={{ color: stage.accentText }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {!collapsed && (
        candidates.length === 0 ? (
          <div
            className="flex items-center justify-center py-8 text-[12px]"
            style={{ color: 'var(--text-placeholder)', background: 'var(--bg)' }}
          >
            No applicants in this stage
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ boxShadow: 'var(--sh-div-t)', background: 'var(--bg-surface)' }}>
                  <th className="pl-4 pr-2 py-2 w-8" />
                  <th className="px-4 py-2 text-left">
                    <SortButton label="Candidate" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                  </th>
                  <th className="px-4 py-2 text-left hidden sm:table-cell" title="Likelihood that this profile is synthetically or AI-generated (lower is safer)">
                    <SortButton label="AI Risk" colKey="score" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                  </th>
                  <th className="px-4 py-2 text-left hidden md:table-cell">
                    <SortButton label="Submitted" colKey="date" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                  </th>
                  <th className="px-4 py-2 text-left hidden lg:table-cell">
                    <span
                      className="text-[11px] font-medium uppercase"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.4px', color: 'var(--text-muted)' }}
                    >
                      Review Log
                    </span>
                  </th>
                  <th className="pr-4 py-2 w-6" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((candidate, i) => (
                  <React.Fragment key={candidate._id}>
                    <CandidateRow
                      candidate={candidate}
                      stage={stage}
                      index={i}
                    />

                    {i < sorted.length - 1 && (
                      <tr aria-hidden="true">
                        <td
                          colSpan={6}
                          style={{ height: 0, padding: 0, boxShadow: 'var(--sh-div-t)' }}
                        />
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

/* ── Main pipeline table ────────────────────────────────────────────── */
export default function PipelineTable({ socket, projectId }) {
  const { data: candidates, isLoading, error, refetch } = useQuery({
    queryKey: ['candidates', projectId],
    queryFn: () => fetchCandidates(projectId),
  });

  const [sortKey, setSortKey] = useState('score');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  useEffect(() => {
    socket.on('candidate_updated', refetch);
    return () => socket.off('candidate_updated', refetch);
  }, [socket, refetch]);

  if (isLoading) return (
    <div
      className="flex items-center justify-center py-16 text-[13px]"
      style={{ color: 'var(--text-muted)' }}
    >
      <Activity size={14} className="animate-pulse mr-2" />
      Loading applicants…
    </div>
  );

  if (error) return (
    <div
      className="flex items-center justify-center py-16 text-[13px]"
      style={{ color: 'var(--badge-red-text)' }}
    >
      Failed to load candidates
    </div>
  );

  const stagesWithData = STAGES.map(stage => ({
    stage,
    candidates: candidates?.filter(c => c.pipeline_status === stage.id) ?? [],
  }));

  // Only render stages that have candidates, but always show all stages
  return (
    <div className="flex flex-col gap-3">
      {stagesWithData.map(({ stage, candidates: stageCandidates }) => (
        <StageSection
          key={stage.id}
          stage={stage}
          candidates={stageCandidates}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ))}
    </div>
  );
}
