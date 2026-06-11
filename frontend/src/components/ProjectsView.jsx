import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  Plus, Briefcase, Users, CheckCircle, AlertTriangle,
  Activity, ChevronRight, MapPin, Users2,
} from 'lucide-react';
import NewProjectModal from './NewProjectModal';

const fetchProjects = () =>
  api.get('/api/projects').then(r => r.data);

/* ── Status badge ─────────────────────────────────────────────────────── */
const STATUS_STYLE = {
  active: { bg: 'var(--badge-green-bg)', text: 'var(--badge-green-text)' },
  paused: { bg: 'var(--badge-blue-bg)',  text: 'var(--badge-blue-text)' },
  closed: { bg: 'var(--badge-neutral-bg)', text: 'var(--badge-neutral-text)' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.active;
  return (
    <span
      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.4px', background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

/* ── Headcount progress bar ───────────────────────────────────────────── */
function HeadcountBar({ filled, total }) {
  const pct = total > 0 ? Math.min((filled / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Strong Matches
        </span>
        <span
          className="text-[11px] font-medium tabular-nums"
          style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}
        >
          {filled} / {total}
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'var(--bg-hover)' }}>
        <div
          className="h-1 rounded-full"
          style={{
            width: `${pct}%`,
            background: pct >= 100 ? 'var(--badge-green-text)' : 'var(--badge-blue-text)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

/* ── Stat pill ────────────────────────────────────────────────────────── */
function MiniStat({ icon: Icon, value, colorVar }) {
  return (
    <div className="flex items-center gap-1">
      <Icon size={11} style={{ color: `var(${colorVar})` }} />
      <span className="text-[12px] tabular-nums font-medium" style={{ color: 'var(--text-body)' }}>
        {value}
      </span>
    </div>
  );
}

/* ── Project card ─────────────────────────────────────────────────────── */
function ProjectCard({ project, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const { stats = {} } = project;

  return (
    <button
      onClick={() => onSelect(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left w-full rounded-lg p-5 flex flex-col gap-4"
      style={{
        background: 'var(--bg)',
        boxShadow: hovered ? 'var(--sh-card-lg)' : 'var(--sh-card)',
        transition: 'box-shadow 0.15s ease',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'var(--badge-blue-bg)' }}
          >
            <Briefcase size={15} style={{ color: 'var(--badge-blue-text)' }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-semibold truncate"
              style={{ letterSpacing: '-0.3px', color: 'var(--text-primary)' }}
            >
              {project.title}
            </p>
            <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {project.department}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={project.status} />
          <ChevronRight
            size={13}
            style={{
              color: hovered ? 'var(--text-primary)' : 'var(--text-placeholder)',
              transition: 'color 0.15s',
            }}
          />
        </div>
      </div>

      {/* Meta: location + headcount */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <MapPin size={11} style={{ color: 'var(--text-placeholder)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{project.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users2 size={11} style={{ color: 'var(--text-placeholder)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {project.headcount} seat{project.headcount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Pipeline mini-stats */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3">
          <MiniStat icon={Users}         value={stats.total ?? 0}         colorVar="--text-muted" />
          <MiniStat icon={CheckCircle}   value={stats.high_signal ?? 0}   colorVar="--badge-green-text" />
          <MiniStat icon={AlertTriangle} value={stats.high_noise ?? 0}    colorVar="--badge-red-text" />
          <MiniStat icon={Activity}      value={stats.processing ?? 0}    colorVar="--badge-blue-text" />
        </div>
        <span className="text-[11px]" style={{ color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}>
          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Progress bar */}
      <HeadcountBar filled={stats.high_signal ?? 0} total={project.headcount} />
    </button>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
function EmptyState({ onNew }) {
  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center text-center py-20 px-6"
      style={{ boxShadow: 'var(--sh-ring)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'var(--badge-blue-bg)' }}
      >
        <Briefcase size={22} style={{ color: 'var(--badge-blue-text)' }} />
      </div>
      <h3 className="mb-2" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>
        No projects yet
      </h3>
      <p className="text-[14px] mb-6 max-w-xs" style={{ color: 'var(--text-body)' }}>
        Create your first hiring project and start screening candidates with AI.
      </p>
      <button onClick={onNew} className="btn-primary gap-2">
        <Plus size={15} />
        New Project
      </button>
    </div>
  );
}

/* ── Projects view ────────────────────────────────────────────────────── */
export default function ProjectsView({ onSelectProject }) {
  const [showModal, setShowModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('picket_welcome_dismissed') !== 'true';
  });

  const dismissWelcome = () => {
    localStorage.setItem('picket_welcome_dismissed', 'true');
    setShowWelcome(false);
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    refetchInterval: 15_000,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="mono-label mb-2">Workspace</p>
          <h2>Projects</h2>
          <p className="text-[15px] mt-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>
            {projects.length > 0
              ? `${projects.filter(p => p.status === 'active').length} active role${projects.filter(p => p.status === 'active').length !== 1 ? 's' : ''}`
              : 'Start by creating your first project'}
          </p>
        </div>
        {projects.length > 0 && (
          <button onClick={() => setShowModal(true)} className="btn-primary gap-1.5 text-sm">
            <Plus size={14} />
            New Project
          </button>
        )}
      </div>

      {showWelcome && (
        <div
          className="rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: 'var(--bg-surface)',
            borderLeft: '4px solid #0068d6',
            boxShadow: 'var(--sh-card)',
          }}
        >
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome to Picket Screening Assistant
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Picket uses background AI agents to scan resumes for template anomalies, verify skills, and request telemetry integrity challenges (PoW) from applicants.
            </p>
          </div>
          <button
            onClick={dismissWelcome}
            className="text-[11px] font-semibold px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg)] cursor-pointer hover:bg-[var(--bg-hover)] shrink-0 self-start md:self-auto"
            style={{ color: 'var(--text-primary)' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid or empty state */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-52 rounded-lg animate-pulse"
              style={{ background: 'var(--bg-hover)' }}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} onSelect={onSelectProject} />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(project) => onSelectProject(project)}
        />
      )}
    </div>
  );
}
