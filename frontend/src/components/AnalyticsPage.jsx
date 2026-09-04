import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
  ChevronLeft, Users, TrendingUp, Clock, CheckCircle,
  BarChart2, Briefcase,
} from 'lucide-react';
import FunnelChart      from './charts/FunnelChart';
import ConfidenceDonut  from './charts/ConfidenceDonut';
import VolumeBarChart   from './charts/VolumeBarChart';
import ProjectComparison from './charts/ProjectComparison';

const fetchAnalytics = (projectId, days) => {
  const params = new URLSearchParams({ days });
  if (projectId) params.set('projectId', projectId);
  return api.get(`/api/analytics?${params}`).then(r => r.data);
};

function KpiCard({ label, value, sub, icon: Icon, accentBg, accentText, loading }) {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-2"
      style={{ background: 'var(--bg)', boxShadow: 'var(--sh-card)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {Icon && (
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: accentBg }}>
            <Icon size={12} style={{ color: accentText }} />
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-9 w-20 rounded-md animate-pulse" style={{ background: 'var(--bg-hover)' }} />
      ) : (
        <p className="text-[38px] font-semibold leading-none" style={{ letterSpacing: '-2px', color: 'var(--text-primary)' }}>
          {value}
        </p>
      )}
      {sub && !loading && (
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>
      )}
    </div>
  );
}

/* ── Chart panel ────────────────────────────────────────────────────── */
function ChartPanel({ title, children, loading }) {
  return (
    <div
      className="rounded-lg p-6 flex flex-col gap-5"
      style={{ background: 'var(--bg)', boxShadow: 'var(--sh-card)' }}
    >
      <p className="mono-label" style={{ color: 'var(--text-placeholder)' }}>{title}</p>
      {loading ? (
        <div className="h-28 rounded-lg animate-pulse" style={{ background: 'var(--bg-hover)' }} />
      ) : children}
    </div>
  );
}

/* ── Date range toggle ──────────────────────────────────────────────── */
const DATE_OPTIONS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

function DateRangePicker({ value, onChange }) {
  return (
    <div
      className="flex items-center rounded-lg overflow-hidden"
      style={{ boxShadow: 'var(--sh-ring)' }}
    >
      {DATE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1.5 text-[12px] font-medium"
          style={{
            background: value === opt.value ? 'var(--text-primary)' : 'var(--bg)',
            color:      value === opt.value ? 'var(--bg)'           : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Format helpers ─────────────────────────────────────────────────── */
function fmtDuration(ms) {
  if (ms === null || ms === undefined) return '-';
  const hrs  = ms / 3_600_000;
  if (hrs < 1)   return `${Math.round(ms / 60_000)}m`;
  if (hrs < 24)  return `${hrs.toFixed(1)}h`;
  return `${(hrs / 24).toFixed(1)}d`;
}

export default function AnalyticsPage({ projectId, project, onBack, onSelectProject }) {
  const [days, setDays] = useState(30);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', projectId ?? 'all', days],
    queryFn:  () => fetchAnalytics(projectId, days),
    staleTime: 60_000,
  });

  const summary    = analytics?.summary;
  const confidence = analytics?.confidence;

  const matchRate = summary?.total
    ? Math.round((summary.strong_match / summary.total) * 100)
    : 0;

  const headcountGoal = project?.headcount ?? null;
  const headcountFill = summary?.strong_match ?? 0;

  const isGlobal = !projectId;

  const totalProjects = analytics?.projects?.length ?? 0;

  return (
    <div className="flex flex-col gap-8">

      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-4 text-[12px]"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ChevronLeft size={13} />
          {project ? project.title : 'Projects'}
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="mono-label mb-2">
              {isGlobal ? 'Workspace' : project?.department}
            </p>
            <h2>Analytics</h2>
            <p className="text-[15px] mt-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>
              {isGlobal
                ? `All projects · ${totalProjects} role${totalProjects !== 1 ? 's' : ''}`
                : `${project?.title} · ${project?.location}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isGlobal && project && (
              <span
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}
              >
                <Briefcase size={10} />
                {project.title}
              </span>
            )}
            <DateRangePicker value={days} onChange={setDays} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Applicants"
          value={summary?.total ?? 0}
          icon={Users}
          accentBg="var(--badge-neutral-bg)"
          accentText="var(--badge-neutral-text)"
          loading={isLoading}
        />
        <KpiCard
          label="Strong Match Rate"
          value={`${matchRate}%`}
          sub={`${summary?.strong_match ?? 0} strong matches`}
          icon={TrendingUp}
          accentBg="var(--badge-green-bg)"
          accentText="var(--badge-green-text)"
          loading={isLoading}
        />
        <KpiCard
          label="Avg. Time to Screen"
          value={fmtDuration(analytics?.avg_time_to_screen_ms)}
          sub="first AI check"
          icon={Clock}
          accentBg="var(--badge-blue-bg)"
          accentText="var(--badge-blue-text)"
          loading={isLoading}
        />
        {isGlobal ? (
          <KpiCard
            label="Active Roles"
            value={totalProjects}
            sub={`${analytics?.projects?.filter(p => p.status !== 'closed').length ?? 0} open`}
            icon={BarChart2}
            accentBg="var(--badge-pink-bg)"
            accentText="var(--badge-pink-text)"
            loading={isLoading}
          />
        ) : (
          <KpiCard
            label="Headcount Progress"
            value={headcountGoal ? `${headcountFill}/${headcountGoal}` : headcountFill}
            sub={headcountGoal && headcountFill >= headcountGoal ? 'All seats filled ✓' : undefined}
            icon={CheckCircle}
            accentBg="var(--badge-green-bg)"
            accentText="var(--badge-green-text)"
            loading={isLoading}
          />
        )}
      </div>

      <ChartPanel title="Application Funnel" loading={isLoading && !analytics}>
        <FunnelChart summary={summary} />
      </ChartPanel>

      <div className={`grid gap-4 ${isGlobal ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <ChartPanel title="AI Confidence Distribution" loading={isLoading && !analytics}>
          <ConfidenceDonut confidence={confidence} />
        </ChartPanel>

        <ChartPanel title={`Applications Over Time - last ${days} days`} loading={isLoading && !analytics}>
          <VolumeBarChart volumeByDay={analytics?.volume_by_day} days={days} />
        </ChartPanel>
      </div>

      {isGlobal && (
        <ChartPanel title="Project Comparison" loading={isLoading && !analytics}>
          <ProjectComparison
            projects={analytics?.projects}
            onSelectProject={onSelectProject}
          />
        </ChartPanel>
      )}

    </div>
  );
}
