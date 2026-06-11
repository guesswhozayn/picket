import { useState, useCallback, useRef } from 'react';
import api from '../api';
import {
  Upload, X, File, Loader, Briefcase,
  CheckCircle, AlertCircle, Trash2, Users,
} from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PoWChallenge from './PoWChallenge';

const fetchProjects = () =>
  api.get('/api/projects').then(r => r.data);

/** Guess a clean display name from a PDF filename */
function guessName(filename) {
  return filename
    .replace(/\.(pdf|docx?|txt)$/i, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Unknown Applicant';
}

/* ── Shared role dropdown ──────────────────────────────────────────── */
function RoleSelect({ value, onChange, projects }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-1.5">
        <Briefcase size={12} style={{ color: 'var(--text-placeholder)' }} />
        Target Role
      </label>
      <select
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border-none outline-none"
        style={{ background: 'var(--bg-input)', boxShadow: 'var(--sh-ring)', color: 'var(--text-primary)' }}
      >
        <option value="" disabled>Select a role…</option>
        {projects.map(p => (
          <option key={p._id} value={p._id}>{p.title}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Status icon for bulk rows ─────────────────────────────────────── */
function RowStatus({ status }) {
  if (status === 'uploading') return <Loader size={14} className="animate-spin" style={{ color: 'var(--badge-blue-text)' }} />;
  if (status === 'done')      return <CheckCircle size={14} style={{ color: 'var(--badge-green-text)' }} />;
  if (status === 'error')     return <AlertCircle size={14} style={{ color: 'var(--badge-red-text)' }} />;
  return <div className="w-3.5 h-3.5 rounded-full" style={{ background: 'var(--bg-hover)' }} />;
}

/* ══════════════════════════════════════════════════════════════════════
   Main modal
══════════════════════════════════════════════════════════════════════ */
export default function UploadModal({ onClose, projectId: initialProjectId, projectTitle }) {
  const queryClient = useQueryClient();

  /* ── Shared state ───────────────────────────────────── */
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'
  const [selectedRoleId, setSelectedRoleId] = useState(initialProjectId || '');
  const dropRef = useRef(null);

  /* ── Single-upload state ─────────────────────────────── */
  const [singleFile, setSingleFile] = useState(null);
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [candidateId, setCandidateId] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);

  /* ── Bulk-upload state ────────────────────────────────── */
  // Each entry: { id, file, name, email, status: 'idle'|'uploading'|'done'|'error', error }
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkDone, setBulkDone] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  /* ── Projects query (only needed when no projectId prop) */
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: !initialProjectId,
    staleTime: 30_000,
  });

  const roleId = initialProjectId || selectedRoleId;

  /* ── Helpers ─────────────────────────────────────────── */
  const invalidate = () => {
    queryClient.invalidateQueries(['candidates']);
    queryClient.invalidateQueries(['analytics']);
    queryClient.invalidateQueries(['projects']);
  };

  const addBulkFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList)
      .filter(f => f.type === 'application/pdf' || f.name.match(/\.pdf$/i))
      .slice(0, 20)
      .map(f => ({
        id:    Math.random().toString(36).slice(2),
        file:  f,
        name:  guessName(f.name),
        email: '',
        status: 'idle',
        error:  null,
      }));
    setBulkRows(prev => [...prev, ...incoming].slice(0, 20));
  }, []);

  const updateRow = (id, patch) =>
    setBulkRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const removeRow = (id) =>
    setBulkRows(prev => prev.filter(r => r.id !== id));

  /* ── Single upload ───────────────────────────────────── */
  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!name || !email) return alert('Name and email are required');
    if (!roleId) return alert('Please select a role');
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      if (singleFile) fd.append('resume', singleFile);
      fd.append('projectId', roleId);
      const res = await api.post('/api/candidates/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCandidateId(res.data._id);
      setShowChallenge(true);
      invalidate();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Bulk upload ─────────────────────────────────────── */
  const handleBulkUpload = async () => {
    if (!roleId) return alert('Please select a role');
    if (bulkRows.length === 0) return alert('Add at least one file');
    setIsBulkUploading(true);

    // Upload each file individually so we can track per-row status
    for (const row of bulkRows) {
      updateRow(row.id, { status: 'uploading' });
      try {
        const fd = new FormData();
        fd.append('name', row.name || guessName(row.file.name));
        fd.append('email', row.email || `applicant-${Date.now()}@review.picket`);
        fd.append('resume', row.file);
        fd.append('projectId', roleId);
        await api.post('/api/candidates/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updateRow(row.id, { status: 'done' });
      } catch (err) {
        updateRow(row.id, { status: 'error', error: err.response?.data?.error || err.message });
      }
    }

    invalidate();
    setBulkDone(true);
    setIsBulkUploading(false);
  };

  /* ── Drag & drop ─────────────────────────────────────── */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 1) {
      setMode('bulk');
      addBulkFiles(files);
    } else if (files.length === 1) {
      if (mode === 'bulk') addBulkFiles(files);
      else setSingleFile(files[0]);
    }
  }, [mode, addBulkFiles]);

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add('drag-over');
  };
  const handleDragLeave = () => dropRef.current?.classList.remove('drag-over');

  /* ── Bulk summary stats ──────────────────────────────── */
  const doneCount  = bulkRows.filter(r => r.status === 'done').length;
  const errorCount = bulkRows.filter(r => r.status === 'error').length;

  /* ═══════════════ RENDER ═══════════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay)' }}
    >
      <div
        className="w-full rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--bg)',
          boxShadow: 'var(--sh-modal)',
          maxWidth: mode === 'bulk' ? '680px' : '448px',
          maxHeight: '90vh',
          transition: 'max-width 0.25s ease',
        }}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ boxShadow: 'var(--sh-div-t)' }}
        >
          <div className="flex items-center gap-3">
            <h4 style={{ letterSpacing: '-0.32px' }}>
              {mode === 'bulk' ? 'Bulk Upload Resumes' : 'Add New Applicant'}
            </h4>
            {/* Mode toggle */}
            {!showChallenge && !bulkDone && (
              <div
                className="flex items-center rounded-md overflow-hidden text-[11px] font-medium"
                style={{ boxShadow: 'var(--sh-ring-lt)' }}
              >
                {['single', 'bulk'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className="px-2.5 py-1 capitalize"
                    style={{
                      background: mode === m ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color:      mode === m ? 'var(--bg)'           : 'var(--text-muted)',
                      border: 'none', cursor: 'pointer',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ══════════ SINGLE MODE ══════════════════════ */}
        {mode === 'single' && !showChallenge && (
          <form onSubmit={handleSingleUpload} className="p-6 flex flex-col gap-5 overflow-y-auto">
            {/* Role: locked label when scoped, dropdown when global */}
            {initialProjectId ? (
              <div>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <Briefcase size={12} style={{ color: 'var(--text-placeholder)' }} />
                  Role
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px]"
                  style={{ background: 'var(--bg-input)', boxShadow: 'var(--sh-ring)', color: 'var(--text-primary)' }}
                >
                  <Briefcase size={13} style={{ color: 'var(--badge-blue-text)', flexShrink: 0 }} />
                  <span className="font-medium">{projectTitle ?? 'Current Role'}</span>
                  <span
                    className="ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}
                  >
                    locked
                  </span>
                </div>
              </div>
            ) : (
              <RoleSelect value={selectedRoleId} onChange={setSelectedRoleId} projects={projects} />
            )}

            <div>
              <label className="mb-1.5 block">Applicant Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
            </div>

            <div>
              <label className="mb-1.5 block">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>

            {/* Drop zone */}
            <div>
              <label className="mb-1.5 block">Resume (PDF)</label>
              <div
                ref={dropRef}
                className="rounded-md p-8 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: 'var(--sh-ring)', background: 'var(--bg)', transition: 'background 0.12s' }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; }}
              >
                <input
                  type="file" accept=".pdf" className="hidden" id="file-upload"
                  onChange={e => setSingleFile(e.target.files[0])}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3 mb-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: singleFile ? 'var(--badge-blue-bg)' : 'var(--bg-surface)', boxShadow: 'var(--sh-ring-lt)' }}
                  >
                    {singleFile
                      ? <File size={18} style={{ color: 'var(--badge-blue-text)' }} />
                      : <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {singleFile ? singleFile.name : 'Click or drag to upload'}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {singleFile ? 'Click to change' : 'PDF up to 5MB · Drop multiple files for bulk mode'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={isUploading} className="btn-primary gap-2 text-sm">
                {isUploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? 'Analyzing profile…' : 'Upload & Screen'}
              </button>
            </div>
          </form>
        )}

        {/* ── Single: Success screen ─────────────────── */}
        {mode === 'single' && showChallenge && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--badge-green-bg)' }}
            >
              <CheckCircle size={22} style={{ color: 'var(--badge-green-text)' }} />
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
                Upload Complete
              </p>
              <p className="text-[13px] mt-1.5 max-w-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                Resume has been queued for screening. If the candidate passes AI verification, an assessment link will be sent to <strong>{email}</strong>.
              </p>
            </div>
            <button onClick={onClose} className="btn-primary text-sm px-6">Close</button>
          </div>
        )}

        {/* ══════════ BULK MODE ════════════════════════ */}
        {mode === 'bulk' && !bulkDone && (
          <div className="p-6 flex flex-col gap-5 overflow-y-auto">
            {/* Role: locked label when scoped, dropdown when global */}
            {initialProjectId ? (
              <div>
                <label className="flex items-center gap-1.5 mb-1.5">
                  <Briefcase size={12} style={{ color: 'var(--text-placeholder)' }} />
                  Role
                </label>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px]"
                  style={{ background: 'var(--bg-input)', boxShadow: 'var(--sh-ring)', color: 'var(--text-primary)' }}
                >
                  <Briefcase size={13} style={{ color: 'var(--badge-blue-text)', flexShrink: 0 }} />
                  <span className="font-medium">{projectTitle ?? 'Current Role'}</span>
                  <span
                    className="ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}
                  >
                    locked
                  </span>
                </div>
              </div>
            ) : (
              <RoleSelect value={selectedRoleId} onChange={setSelectedRoleId} projects={projects} />
            )}

            {/* Drop zone / file picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label>Resumes (PDF · up to 20 files)</label>
                {bulkRows.length > 0 && !isBulkUploading && (
                  <button
                    type="button"
                    className="text-[11px]"
                    style={{ color: 'var(--badge-red-text)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setBulkRows([])}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div
                ref={dropRef}
                className="rounded-md p-6 flex flex-col items-center justify-center text-center"
                style={{ boxShadow: 'var(--sh-ring)', background: 'var(--bg)', transition: 'background 0.12s' }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; }}
              >
                <input
                  type="file" accept=".pdf" multiple className="hidden" id="bulk-file-upload"
                  onChange={e => addBulkFiles(e.target.files)}
                />
                <label htmlFor="bulk-file-upload" className="cursor-pointer flex flex-col items-center gap-2 mb-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: bulkRows.length ? 'var(--badge-blue-bg)' : 'var(--bg-surface)', boxShadow: 'var(--sh-ring-lt)' }}
                  >
                    <Users size={16} style={{ color: bulkRows.length ? 'var(--badge-blue-text)' : 'var(--text-muted)' }} />
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {bulkRows.length ? `${bulkRows.length} file${bulkRows.length !== 1 ? 's' : ''} selected — click to add more` : 'Click or drag PDFs here'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Names are auto-detected from filenames · Add emails per row below
                  </p>
                </label>
              </div>
            </div>

            {/* File rows */}
            {bulkRows.length > 0 && (
              <div
                className="rounded-lg overflow-hidden"
                style={{ boxShadow: 'var(--sh-ring)', maxHeight: '280px', overflowY: 'auto' }}
              >
                {/* Table header */}
                <div
                  className="grid text-[10px] font-semibold uppercase px-3 py-2"
                  style={{ gridTemplateColumns: '16px 1fr 1fr 1fr 28px', gap: '8px', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
                >
                  <span />
                  <span>Filename</span>
                  <span>Name</span>
                  <span>Email</span>
                  <span />
                </div>

                {bulkRows.map((row, i) => (
                  <div
                    key={row.id}
                    className="grid items-center px-3 py-2 gap-2"
                    style={{
                      gridTemplateColumns: '16px 1fr 1fr 1fr 28px',
                      background: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-surface)',
                      boxShadow: 'var(--sh-div-t)',
                    }}
                  >
                    {/* Status */}
                    <RowStatus status={row.status} />

                    {/* Filename */}
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {row.file.name}
                    </p>

                    {/* Name */}
                    <input
                      type="text"
                      value={row.name}
                      disabled={isBulkUploading || row.status === 'done'}
                      onChange={e => updateRow(row.id, { name: e.target.value })}
                      placeholder="Applicant name"
                      className="text-[12px] px-2 py-1 rounded"
                      style={{ background: 'var(--bg)', boxShadow: 'var(--sh-ring-lt)', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%' }}
                    />

                    {/* Email */}
                    <input
                      type="email"
                      value={row.email}
                      disabled={isBulkUploading || row.status === 'done'}
                      onChange={e => updateRow(row.id, { email: e.target.value })}
                      placeholder="email (optional)"
                      className="text-[12px] px-2 py-1 rounded"
                      style={{ background: 'var(--bg)', boxShadow: 'var(--sh-ring-lt)', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%' }}
                    />

                    {/* Remove */}
                    {row.status === 'idle' && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-placeholder)', padding: '2px' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--badge-red-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-placeholder)'; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {bulkRows.length > 0
                  ? `${bulkRows.length} resume${bulkRows.length !== 1 ? 's' : ''} · PoW verification skipped for internal uploads`
                  : 'No files added yet'}
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
                <button
                  type="button"
                  disabled={isBulkUploading || bulkRows.length === 0}
                  onClick={handleBulkUpload}
                  className="btn-primary gap-2 text-sm"
                >
                  {isBulkUploading
                    ? <><Loader size={14} className="animate-spin" /> Screening {bulkRows.filter(r => r.status === 'done').length}/{bulkRows.length}…</>
                    : <><Upload size={14} /> Screen {bulkRows.length} Resume{bulkRows.length !== 1 ? 's' : ''}</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk: Done summary ────────────────────── */}
        {mode === 'bulk' && bulkDone && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: errorCount === 0 ? 'var(--badge-green-bg)' : 'var(--badge-blue-bg)' }}
            >
              <CheckCircle size={22} style={{ color: errorCount === 0 ? 'var(--badge-green-text)' : 'var(--badge-blue-text)' }} />
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
                {doneCount} of {bulkRows.length} uploaded
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-body)' }}>
                {doneCount > 0 && `${doneCount} applicant${doneCount !== 1 ? 's' : ''} added to the screening queue.`}
                {errorCount > 0 && ` ${errorCount} failed — check emails or retry.`}
              </p>
            </div>
            <button onClick={onClose} className="btn-primary text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
