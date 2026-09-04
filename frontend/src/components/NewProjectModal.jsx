import React, { useState } from 'react';
import api from '../api';
import { X, Briefcase, Loader } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const DEPARTMENTS = [
  'Engineering', 'Design', 'Product', 'Marketing',
  'Sales', 'Operations', 'Finance', 'People & HR', 'Other',
];

export default function NewProjectModal({ onClose, onCreated }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '', department: 'Engineering',
    location: 'Remote', headcount: 1, description: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post('/api/projects', {
        ...form,
        headcount: Number(form.headcount),
      });
      qc.invalidateQueries(['projects']);
      onCreated?.(data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ background: 'var(--bg)', boxShadow: 'var(--sh-modal)' }}
      >

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ boxShadow: 'var(--sh-div-t)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'var(--badge-blue-bg)' }}
            >
              <Briefcase size={14} style={{ color: 'var(--badge-blue-text)' }} />
            </div>
            <h4 style={{ letterSpacing: '-0.32px' }}>New Project</h4>
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

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          <div>
            <label htmlFor="proj-title">Role Title <span style={{ color: 'var(--badge-red-text)' }}>*</span></label>
            <input
              id="proj-title"
              type="text"
              required
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-dept">Department</label>
              <select
                id="proj-dept"
                value={form.department}
                onChange={set('department')}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--sh-ring)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="proj-loc">Location</label>
              <input
                id="proj-loc"
                type="text"
                value={form.location}
                onChange={set('location')}
                placeholder="Remote / NYC"
              />
            </div>
          </div>

          <div>
            <label htmlFor="proj-headcount">Headcount (seats to fill)</label>
            <input
              id="proj-headcount"
              type="number"
              min="1"
              max="999"
              value={form.headcount}
              onChange={set('headcount')}
            />
          </div>

          <div>
            <label htmlFor="proj-desc">
              Job Description
              <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                - optional
              </span>
            </label>
            <textarea
              id="proj-desc"
              rows={4}
              value={form.description}
              onChange={set('description')}
              placeholder="Paste or summarise the JD here…"
              style={{ resize: 'vertical', minHeight: '88px' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" disabled={busy || !form.title.trim()} className="btn-primary gap-2 text-sm">
              {busy ? <Loader size={14} className="animate-spin" /> : <Briefcase size={14} />}
              {busy ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
