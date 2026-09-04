import React, { useState } from 'react';
import { Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreBar, AgentLogDrawer, STAGES } from './PipelineShared';

function BoardCard({ candidate }) {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round(candidate.synthetic_probability * 100);
  const hasLog = (candidate.agent_audit_trail && candidate.agent_audit_trail.length > 0) || candidate.pow_data;

  return (
    <div
      className="bg-[var(--bg)] border border-[var(--border-color)] rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md"
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={() => hasLog && setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] shrink-0">
              {candidate.name?.charAt(0)?.toUpperCase() ?? <User size={10} />}
            </div>
            <div className="min-w-0">
              <h4 className="text-[12px] font-bold text-[var(--text-primary)] truncate leading-tight">
                {candidate.name}
              </h4>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {candidate.email}
              </p>
            </div>
          </div>
          {hasLog && (
            <span className="text-[var(--text-placeholder)] ml-2 shrink-0">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
        </div>

        <div className="mb-2">
          <ScoreBar score={score} />
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-color)]">
          <span className="text-[9px] text-[var(--text-muted)] font-mono">
            {new Date(candidate.submitted_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {hasLog && (
            <span
              className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-text)' }}
            >
              <Clock size={8} />
              {candidate.agent_audit_trail.length} logs
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-color)]">
          <AgentLogDrawer candidate={candidate} />
        </div>
      )}
    </div>
  );
}

export default function PipelineBoard({ candidates }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[500px]">
      {STAGES.map(stage => {
        const stageCandidates = candidates.filter(c => c.pipeline_status === stage.id);
        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 rounded-xl flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)]"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: stage.accentBg }}
            >
              <div className="flex items-center gap-2">
                <stage.Icon size={14} style={{ color: stage.accent }} className={stage.animate ? 'animate-pulse' : ''} />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: stage.accentText }}>
                  {stage.label}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/50 px-2 py-0.5 rounded-full shadow-sm text-[var(--text-muted)]">
                {stageCandidates.length}
              </span>
            </div>

            <div className="p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3 flex-1">
              {stageCandidates.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-[11px] text-[var(--text-placeholder)] italic border-2 border-dashed border-[var(--border-color)] rounded-lg">
                  No candidates
                </div>
              ) : (
                stageCandidates.sort((a, b) => b.synthetic_probability - a.synthetic_probability).map(candidate => (
                  <BoardCard key={candidate._id} candidate={candidate} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
