import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  ChevronLeft, MapPin, Users2, Zap,
  ArrowRight, TrendingUp, CheckCircle, AlertTriangle, Trash2, Plus,
} from 'lucide-react';
import PipelineTable from './PipelineTable';

const fetchProject = (id) =>
  api.get(`/api/projects/${id}`).then(r => r.data);

/* ── Stat card ─────────────────────────────────────────────────────── */
function StatCard({ label, value, loading, accentBg, accentText, icon: Icon }) {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-2"
      style={{ background: 'var(--bg)', boxShadow: 'var(--sh-card)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {Icon && (
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: accentBg }}
          >
            <Icon size={12} style={{ color: accentText }} />
          </div>
        )}
      </div>
      <p
        className="text-[38px] font-semibold leading-none"
        style={{ letterSpacing: '-2px', color: 'var(--text-primary)' }}
      >
        {loading ? (
          <span
            className="inline-block w-14 h-8 rounded-md animate-pulse"
            style={{ background: 'var(--bg-hover)' }}
          />
        ) : (value ?? 0)}
      </p>
    </div>
  );
}

/* ── Headcount progress ─────────────────────────────────────────────── */
function HeadcountProgress({ filled, total }) {
  const pct = total > 0 ? Math.min((filled / total) * 100, 100) : 0;
  const color = pct >= 100 ? 'var(--badge-green-text)' : 'var(--badge-blue-text)';
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-3"
      style={{ background: 'var(--bg)', boxShadow: 'var(--sh-card)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>Headcount</p>
        <TrendingUp size={12} style={{ color }} />
      </div>
      <p
        className="text-[38px] font-semibold leading-none"
        style={{ letterSpacing: '-2px', color: 'var(--text-primary)' }}
      >
        {filled}
        <span className="text-[20px] font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
          / {total}
        </span>
      </p>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-hover)' }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.5s ease' }}
        />
      </div>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {pct >= 100 ? 'All seats filled ✓' : `${Math.round(pct)}% toward headcount goal`}
      </p>
    </div>
  );
}

/* ── Workflow summary row ───────────────────────────────────────────── */
const WORKFLOW_STEPS = [
  { step: 'Screen', sub: 'AI Screening',    color: '#0a72ef', key: 'processing' },
  { step: 'Review', sub: 'Recruiter Review', color: '#de1d8d', key: 'audit_required' },
  { step: 'Decide', sub: 'Hiring Decision', color: '#1a7f4b', key: 'high_signal' },
];

function WorkflowSummary({ stats, loading }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ boxShadow: 'var(--sh-ring)' }}>
      {WORKFLOW_STEPS.map((s, i) => (
        <div
          key={s.step}
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'var(--bg)',
            boxShadow: i < WORKFLOW_STEPS.length - 1 ? 'var(--sh-div-t)' : 'none',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="mono-label" style={{ color: s.color, fontWeight: 600 }}>{s.step}</span>
            <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{s.sub}</span>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <span
                className="inline-block w-10 h-4 rounded animate-pulse"
                style={{ background: 'var(--bg-hover)' }}
              />
            ) : (
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                {stats[s.key] ?? 0} candidates
              </span>
            )}
            <ArrowRight size={14} style={{ color: 'var(--text-placeholder)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Project detail view ────────────────────────────────────────────── */
export default function ProjectDetailView({ project: initialProject, socket, onBack, onUpload }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', initialProject._id],
    queryFn: () => fetchProject(initialProject._id),
    initialData: initialProject,
    refetchInterval: 15_000,
  });

  const qc      = useQueryClient();
  const stats    = project?.stats ?? {};
  const [confirm, setConfirm] = useState(false); // show inline confirmation
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/projects/${project._id}`);
      qc.invalidateQueries(['projects']);
      qc.invalidateQueries(['candidates']);
      qc.invalidateQueries(['analytics']);
      onBack();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close project');
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb + meta */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 text-[12px]"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ChevronLeft size={13} />
          All Projects
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="mono-label mb-2">{project.department}</p>
            <h2>{project.title}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--text-body)' }}>
                <MapPin size={12} style={{ color: 'var(--text-placeholder)' }} />
                {project.location}
              </span>
              <span className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--text-body)' }}>
                <Users2 size={12} style={{ color: 'var(--text-placeholder)' }} />
                {project.headcount} open seat{project.headcount !== 1 ? 's' : ''}
              </span>
            </div>
            {project.description && (
              <p className="text-[13px] mt-2 max-w-prose leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {project.description}
              </p>
            )}
          </div>
          <button onClick={onUpload} className="btn-primary gap-1.5 shrink-0 text-sm">
            <Plus size={14} />
            Upload Resume
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applicants" value={stats.total} loading={isLoading}
          icon={Users2} accentBg="var(--badge-neutral-bg)" accentText="var(--badge-neutral-text)"
        />
        <StatCard
          label="Strong Matches" value={stats.high_signal} loading={isLoading}
          icon={CheckCircle} accentBg="var(--badge-green-bg)" accentText="var(--badge-green-text)"
        />
        <StatCard
          label="Poor Matches" value={stats.high_noise} loading={isLoading}
          icon={AlertTriangle} accentBg="var(--badge-red-bg)" accentText="var(--badge-red-text)"
        />
        <HeadcountProgress filled={stats.high_signal ?? 0} total={project.headcount} />
      </div>

      {/* Workflow summary */}
      <WorkflowSummary stats={stats} loading={isLoading} />

      {/* Pipeline table */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3>Applicants</h3>
          <span
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1 rounded-full"
            style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}
          >
            <Zap size={11} />
            Live Updates
          </span>
        </div>
        <PipelineTable socket={socket} projectId={project._id} />
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────── */}
      <div
        className="rounded-lg p-5"
        style={{ boxShadow: confirm ? 'var(--sh-card)' : 'var(--sh-ring)', transition: 'box-shadow 0.2s' }}
      >
        {!confirm ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                Close &amp; Delete Project
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Permanently removes this project and all {stats.total ?? 0} applicant record{(stats.total ?? 0) !== 1 ? 's' : ''} from the system.
              </p>
            </div>
            <button
              onClick={() => setConfirm(true)}
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md shrink-0 ml-4"
              style={{ background: 'var(--badge-red-bg)', color: 'var(--badge-red-text)', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <Trash2 size={13} />
              Close Project
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Warning banner */}
            <div
              className="rounded-md px-4 py-3 text-[12px] leading-relaxed"
              style={{ background: 'var(--badge-red-bg)', color: 'var(--badge-red-text)' }}
            >
              <strong>This action cannot be undone.</strong> The following will be permanently deleted:
              <ul className="list-disc list-inside mt-1.5 space-y-0.5">
                <li>Project: <strong>{project.title}</strong></li>
                <li>{stats.total ?? 0} applicant record{(stats.total ?? 0) !== 1 ? 's' : ''} and all resume content</li>
                <li>All AI screening logs for this project</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirm(false)}
                disabled={deleting}
                className="btn-secondary text-sm"
              >
                Keep Project
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-md"
                style={{
                  background: 'var(--badge-red-text)',
                  color: '#fff',
                  border: 'none',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? (
                  <><span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Deleting…</>
                ) : (
                  <><Trash2 size={13} /> Yes, permanently delete</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
