import React, { useEffect, useRef } from 'react';
import {
  X, CheckCircle, AlertTriangle, Activity, XCircle,
  Clock, Calendar, Briefcase, Shield,
} from 'lucide-react';

const STAGE_META = {
  processing:     { label: 'Pending Audit',  bg: 'var(--badge-blue-bg)',    text: 'var(--badge-blue-text)',    Icon: Activity,      animate: true  },
  high_signal:    { label: 'High Signal',    bg: 'var(--badge-green-bg)',   text: 'var(--badge-green-text)',   Icon: CheckCircle,   animate: false },
  audit_required: { label: 'Manual Review',  bg: 'var(--badge-pink-bg)',    text: 'var(--badge-pink-text)',    Icon: AlertTriangle, animate: false },
  high_noise:     { label: 'High Noise',     bg: 'var(--badge-red-bg)',     text: 'var(--badge-red-text)',     Icon: AlertTriangle, animate: false },
  rejected:       { label: 'Rejected',       bg: 'var(--badge-neutral-bg)', text: 'var(--badge-neutral-text)', Icon: XCircle,       animate: false },
};

function scoreTheme(score) {
  if (score < 30) return { bar: 'var(--badge-green-text)', bg: 'var(--badge-green-bg)', text: 'var(--badge-green-text)', label: 'High Confidence' };
  if (score < 70) return { bar: '#0068d6',                 bg: 'var(--badge-blue-bg)',  text: 'var(--badge-blue-text)',  label: 'Moderate Confidence' };
  return           { bar: 'var(--badge-red-text)',          bg: 'var(--badge-red-bg)',   text: 'var(--badge-red-text)',   label: 'Low Confidence' };
}

function MetaRow({ icon: Icon, label, value }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <Icon size={13} style={{ color: 'var(--text-placeholder)', marginTop: '2px', flexShrink: 0 }} />
      <span className="text-[12px] w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-[13px] font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

/* ── Candidate drawer ───────────────────────────────────────────────── */
export default function CandidateDrawer({ candidate, onClose, projectTitle }) {
  const drawerRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus inside drawer
  useEffect(() => {
    drawerRef.current?.focus();
  }, []);

  if (!candidate) return null;

  const score  = Math.round(candidate.synthetic_probability * 100);
  const theme  = scoreTheme(score);
  const stage  = STAGE_META[candidate.pipeline_status] ?? STAGE_META.rejected;
  const { Icon: StageIcon, animate } = stage;

  const submittedAt = candidate.createdAt
    ? new Date(candidate.createdAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  const powScore = candidate.pow_data?.score != null
    ? `${candidate.pow_data.score} pts`
    : null;

  return (
    <>

      <div
        className="fixed inset-0 z-40"
        style={{ background: 'var(--overlay)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Candidate: ${candidate.name}`}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-md outline-none"
        style={{
          background: 'var(--bg)',
          boxShadow: 'var(--sh-modal)',
          animation: 'drawer-slide-in 0.2s ease-out',
        }}
      >

        <div
          className="flex items-start justify-between px-6 py-5 shrink-0"
          style={{ boxShadow: 'var(--sh-div-t)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0"
              style={{ background: stage.bg, color: stage.text }}
            >
              {candidate.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <h4
                className="truncate"
                style={{ letterSpacing: '-0.32px', color: 'var(--text-primary)', fontSize: '15px' }}
              >
                {candidate.name}
              </h4>
              <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {candidate.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md shrink-0 ml-2"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 flex flex-col gap-6">

          <div className="rounded-lg p-5" style={{ background: theme.bg, boxShadow: 'var(--sh-ring)' }}>
            <p className="mono-label mb-3" style={{ color: theme.text }}>AI Content Risk</p>
            <div className="flex items-end justify-between mb-3">
              <p
                className="text-[52px] font-semibold leading-none"
                style={{ letterSpacing: '-2.5px', color: theme.text }}
              >
                {score}%
              </p>
              <span
                className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full mb-1"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.4px',
                  background: 'var(--bg)',
                  color: theme.text,
                  boxShadow: 'var(--sh-ring-lt)',
                }}
              >
                {theme.label}
              </span>
            </div>

            <div className="h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${score}%`, background: theme.bar, transition: 'width 0.5s ease' }}
              />
            </div>
          </div>

          <div>
            <p className="mono-label mb-1" style={{ color: 'var(--text-placeholder)' }}>Details</p>
            <div>

              <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <StageIcon
                  size={13}
                  className={animate ? 'animate-pulse' : ''}
                  style={{ color: stage.text, marginTop: '2px', flexShrink: 0 }}
                />
                <span className="text-[12px] w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>Stage</span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: stage.bg, color: stage.text }}
                >
                  {stage.label}
                </span>
              </div>
              <MetaRow icon={Briefcase}  label="Role"        value={projectTitle ?? '-'} />
              <MetaRow icon={Calendar}   label="Applied"     value={submittedAt} />
              <MetaRow icon={Shield}     label="Verification" value={powScore ?? '-'} />
              <MetaRow
                icon={Clock}
                label="Checks Run"
                value={candidate.agent_audit_trail?.length
                  ? `${candidate.agent_audit_trail.length} check${candidate.agent_audit_trail.length === 1 ? '' : 's'}`
                  : 'None'}
              />
            </div>
          </div>

          {candidate.agent_audit_trail?.length > 0 && (
            <div>
              <p className="mono-label mb-3" style={{ color: 'var(--text-placeholder)' }}>
                AI Screening Log - {candidate.agent_audit_trail.length}
              </p>
              <div className="flex flex-col gap-2">
                {candidate.agent_audit_trail.map((log, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{ background: 'var(--bg-surface)', boxShadow: 'var(--sh-ring)' }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.4px',
                          background: 'var(--badge-neutral-bg)',
                          color: 'var(--badge-neutral-text)',
                        }}
                      >
                        {log.agent_name}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}
                      >
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-body)' }}>
                      {log.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidate.raw_resume_text && candidate.raw_resume_text !== 'No resume provided' && (
            <details className="group">
              <summary
                className="cursor-pointer text-[12px] font-medium list-none flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="mono-label">Resume Content</span>
              </summary>
              <pre
                className="mt-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words rounded-lg p-4"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-body)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: 'var(--sh-ring)',
                  maxHeight: '240px',
                  overflow: 'auto',
                }}
              >
                {candidate.raw_resume_text}
              </pre>
            </details>
          )}
        </div>
      </div>

      <style>{`
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
}
