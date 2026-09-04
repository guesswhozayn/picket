import React from 'react';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const STAGES = [
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

export function ScorePill({ score }) {
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

export function ScoreBar({ score }) {
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

export function AgentLogDrawer({ candidate }) {
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
                <span className="text-[var(--badge-green-text)]">✓ Verified: Natural keystroke pattern detected.</span>
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
