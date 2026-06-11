import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  Activity, CheckCircle, XCircle, AlertTriangle,
  ArrowUpDown, ArrowUp, ArrowDown,
  Briefcase, Plus, Users,
  ChevronLeft, RefreshCw,
} from 'lucide-react';
import CandidatesToolbar from './CandidatesToolbar';
import CandidateDrawer from './CandidateDrawer';

/* ── Fetch ──────────────────────────────────────────────────────────── */
const fetchCandidates = (projectId) => {
  const url = projectId
    ? `/api/candidates?projectId=${projectId}`
    : '/api/candidates';
  return api.get(url).then(r => r.data);
};

const fetchProject = (id) =>
  id ? api.get(`/api/projects/${id}`).then(r => r.data) : null;

/* ── Stage meta (shared) ────────────────────────────────────────────── */
const STAGE_META = {
  processing:     { label: 'Under Review',    bg: 'var(--badge-blue-bg)',    text: 'var(--badge-blue-text)',    Icon: Activity,      animate: true  },
  high_signal:    { label: 'Strong Match',    bg: 'var(--badge-green-bg)',   text: 'var(--badge-green-text)',   Icon: CheckCircle,   animate: false },
  audit_required: { label: 'Needs Attention', bg: 'var(--badge-pink-bg)',    text: 'var(--badge-pink-text)',    Icon: AlertTriangle, animate: false },
  high_noise:     { label: 'Poor Match',      bg: 'var(--badge-red-bg)',     text: 'var(--badge-red-text)',     Icon: AlertTriangle, animate: false },
  rejected:       { label: 'Declined',        bg: 'var(--badge-neutral-bg)', text: 'var(--badge-neutral-text)', Icon: XCircle,       animate: false },
};

/* ── Score helpers ──────────────────────────────────────────────────── */
function scoreBand(score) {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
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
        background: 'transparent', border: 'none', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-muted)'; }}
    >
      {label} <Icon size={10} />
    </button>
  );
}

/* ── Candidate row ──────────────────────────────────────────────────── */
function CandidateRow({ candidate, onOpen, onScreen, showProject, projectTitle }) {
  const score = Math.round(candidate.synthetic_probability * 100);
  const stage = STAGE_META[candidate.pipeline_status] ?? STAGE_META.rejected;
  const { Icon: StageIcon, animate } = stage;
  const [hovered, setHovered] = useState(false);

  const scoreColor  = score < 30 ? 'var(--badge-green-text)' : score < 70 ? '#0068d6' : 'var(--badge-red-text)';
  const scoreBgVar  = score < 30 ? '--badge-green-bg'  : score < 70 ? '--badge-blue-bg'  : '--badge-red-bg';
  const scoreTextVar= score < 30 ? '--badge-green-text' : score < 70 ? '--badge-blue-text' : '--badge-red-text';
  const scoreLabel  = score < 30 ? 'High Confidence' : score < 70 ? 'Moderate' : 'Low Confidence';

  const submittedAt = candidate.createdAt
    ? new Date(candidate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <tr
      onClick={() => onOpen(candidate)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-hover)' : 'var(--bg)',
        cursor: 'pointer',
        transition: 'background 0.12s ease',
      }}
    >
      {/* Avatar + name + email */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: stage.bg, color: stage.text }}
          >
            {candidate.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
              {candidate.name}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
              {candidate.email}
            </p>
          </div>
        </div>
      </td>

      {/* Stage badge */}
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ background: stage.bg, color: stage.text }}
        >
          <StageIcon size={10} className={animate ? 'animate-pulse' : ''} />
          {stage.label}
        </span>
      </td>

      {/* Score */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <div className="h-1 rounded-full" style={{ background: 'var(--bg-hover)', width: '64px' }}>
            <div
              className="h-1 rounded-full"
              style={{ width: `${score}%`, background: scoreColor, transition: 'width 0.4s ease' }}
            />
          </div>
          <span
            className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full"
            style={{ background: `var(${scoreBgVar})`, color: `var(${scoreTextVar})`, minWidth: '40px', textAlign: 'center' }}
            title={scoreLabel}
          >
            {score}%
          </span>
        </div>
      </td>

      {/* Project (global mode only) */}
      {showProject && (
        <td className="px-4 py-3 hidden md:table-cell">
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {projectTitle ?? '—'}
          </span>
        </td>
      )}

      {/* Submitted */}
      <td
        className="px-4 py-3 hidden md:table-cell text-[12px]"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {submittedAt}
      </td>

      {/* Audit entries */}
      <td className="px-4 py-3 hidden lg:table-cell pr-5">
        {candidate.agent_audit_trail?.length > 0 ? (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'var(--badge-neutral-bg)', color: 'var(--badge-neutral-text)' }}
          >
            {candidate.agent_audit_trail.length}
          </span>
        ) : (
          <span style={{ color: 'var(--text-placeholder)', fontSize: '11px' }}>—</span>
        )}
      </td>

      {/* Re-screen action (visible on row hover) */}
      <td className="px-3 py-3 text-right" style={{ width: '44px' }}>
        {candidate.pipeline_status !== 'processing' && (
          <button
            onClick={(e) => { e.stopPropagation(); onScreen(candidate._id); }}
            title="Re-screen this applicant"
            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-placeholder)',
              transition: 'opacity 0.12s, color 0.12s',
              display: hovered ? 'inline-flex' : 'none',
              alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--badge-blue-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-placeholder)'; }}
          >
            <RefreshCw size={13} />
          </button>
        )}
      </td>
    </tr>
  );
}

/* ── Skeleton rows ──────────────────────────────────────────────────── */
function SkeletonRows() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i}>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full animate-pulse" style={{ background: 'var(--bg-hover)' }} />
          <div className="flex flex-col gap-1.5">
            <div className="w-32 h-3 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
            <div className="w-24 h-2.5 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="w-20 h-5 rounded-full animate-pulse" style={{ background: 'var(--bg-hover)' }} /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="w-24 h-3 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="w-20 h-3 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="w-8 h-4 rounded-full animate-pulse" style={{ background: 'var(--bg-hover)' }} /></td>
    </tr>
  ));
}

/* ── Empty state ────────────────────────────────────────────────────── */
function EmptyState({ filtered, onClear, onUpload }) {
  if (filtered) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              No applicants match your filters
            </p>
            <button
              onClick={onClear}
              className="text-[13px] mt-1"
              style={{ color: 'var(--badge-blue-text)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear filters
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'var(--badge-blue-bg)' }}
          >
            <Users size={22} style={{ color: 'var(--badge-blue-text)' }} />
          </div>
          <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            No applicants yet
          </p>
          <p className="text-[13px] mb-5 max-w-xs" style={{ color: 'var(--text-body)' }}>
            Add your first resume above to begin screening with AI.
          </p>
          {onUpload && (
            <button onClick={onUpload} className="btn-primary gap-2 text-sm">
              <Plus size={14} />
              Upload Resume
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function CandidatesPage({ projectId, onBack, onUpload, socket }) {
  const qc = useQueryClient();

  // Data — filter out orphans (no projectId) in global view
  const { data: rawCandidates = [], isLoading, refetch } = useQuery({
    queryKey: ['candidates', projectId ?? 'all'],
    queryFn: () => fetchCandidates(projectId),
    staleTime: 10_000,
  });

  // In global mode, hide candidates with no project (orphans)
  const candidates = useMemo(
    () => projectId ? rawCandidates : rawCandidates.filter(c => c.projectId),
    [rawCandidates, projectId]
  );

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  // Toolbar state
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState([]);
  const [scoreFilter, setScoreFilter] = useState([]);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [drawerCandidate, setDrawerCandidate] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 180);
    return () => clearTimeout(t);
  }, [search]);

  // Socket live updates
  useEffect(() => {
    if (!socket) return;
    socket.on('candidate_updated', refetch);
    return () => socket.off('candidate_updated', refetch);
  }, [socket, refetch]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...candidates];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }

    if (stageFilter.length > 0) {
      list = list.filter(c => stageFilter.includes(c.pipeline_status));
    }

    if (scoreFilter.length > 0) {
      list = list.filter(c => {
        const band = scoreBand(Math.round(c.synthetic_probability * 100));
        return scoreFilter.includes(band);
      });
    }

    list.sort((a, b) => {
      let av, bv;
      if (sortKey === 'score') {
        av = a.synthetic_probability; bv = b.synthetic_probability;
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      if (sortKey === 'date') {
        av = new Date(a.createdAt ?? 0); bv = new Date(b.createdAt ?? 0);
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      if (sortKey === 'stage') {
        const ORDER = ['processing', 'high_signal', 'audit_required', 'high_noise', 'rejected'];
        av = ORDER.indexOf(a.pipeline_status); bv = ORDER.indexOf(b.pipeline_status);
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      // name
      av = a.name?.toLowerCase() ?? ''; bv = b.name?.toLowerCase() ?? '';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [candidates, debouncedSearch, stageFilter, scoreFilter, sortKey, sortDir]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }, [sortKey]);

  const clearFilters = () => { setSearch(''); setStageFilter([]); setScoreFilter([]); };
  const isFiltered = search || stageFilter.length > 0 || scoreFilter.length > 0;
  const showProject = !projectId; // show project column in global mode

  // Re-screen a single candidate
  const handleScreen = useCallback(async (candidateId) => {
    try {
      await api.post(`/api/candidates/${candidateId}/screen`);
      qc.invalidateQueries(['candidates', projectId ?? 'all']);
      qc.invalidateQueries(['analytics']);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to trigger screening');
    }
  }, [projectId, qc]);

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        {projectId && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 mb-4 text-[12px]"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ChevronLeft size={13} />
            {project?.title ?? 'Project'}
          </button>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="mono-label mb-2">
              {projectId && project ? project.department : 'All Projects'}
            </p>
            <h2>Candidates</h2>
            <p className="text-[15px] mt-2 leading-relaxed" style={{ color: 'var(--text-body)' }}>
              {projectId && project
                ? `${project.title} · ${project.location}`
                : 'Viewing all candidates across all projects'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {projectId && (
              <span
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}
              >
                <Briefcase size={10} />
                {project?.title ?? '…'}
              </span>
            )}
            {onUpload && (
              <button onClick={onUpload} className="btn-primary gap-1.5 text-sm">
                <Plus size={14} />
                Upload Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <CandidatesToolbar
        search={search}
        onSearch={setSearch}
        stageFilter={stageFilter}
        onStageFilter={setStageFilter}
        scoreFilter={scoreFilter}
        onScoreFilter={setScoreFilter}
        totalShown={filtered.length}
        totalAll={candidates.length}
      />

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ boxShadow: 'var(--sh-card)' }}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: 'var(--bg-surface)', boxShadow: 'var(--sh-div-t)' }}>
                <th className="px-5 py-2.5 text-left">
                  <SortButton label="Candidate" colKey="name"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-2.5 text-left">
                  <SortButton label="Stage"     colKey="stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-2.5 text-left hidden sm:table-cell" title="Likelihood that this profile is synthetically or AI-generated (lower is safer)">
                  <SortButton label="AI Risk" colKey="score" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                {showProject && (
                  <th className="px-4 py-2.5 text-left hidden md:table-cell">
                    <span className="text-[11px] font-medium uppercase"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>
                      Project
                    </span>
                  </th>
                )}
                <th className="px-4 py-2.5 text-left hidden md:table-cell">
                  <SortButton label="Submitted" colKey="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="px-4 py-2.5 text-left hidden lg:table-cell pr-5">
                  <span className="text-[11px] font-medium uppercase"
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>
                    Review Log
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <EmptyState
                  filtered={!!isFiltered}
                  onClear={clearFilters}
                  onUpload={onUpload}
                />
              ) : (
                filtered.map((c, i) => (
                  <React.Fragment key={c._id}>
                    <CandidateRow
                      candidate={c}
                      onOpen={setDrawerCandidate}
                      onScreen={handleScreen}
                      showProject={showProject}
                      projectTitle={project?.title}
                    />
                    {i < filtered.length - 1 && (
                      <tr aria-hidden="true">
                        <td colSpan={showProject ? 7 : 6} style={{ height: 0, padding: 0, boxShadow: 'var(--sh-div-t)' }} />
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawerCandidate && (
        <CandidateDrawer
          candidate={drawerCandidate}
          projectTitle={project?.title}
          onClose={() => setDrawerCandidate(null)}
        />
      )}
    </div>
  );
}
