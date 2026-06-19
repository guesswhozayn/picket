import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Lock, Shield, Mail, CheckCircle,
  AlertCircle, RefreshCw, Trash2, UserPlus,
  ChevronRight, Key, LogOut
} from 'lucide-react';
import api from '../api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <header>
        <h2 className="mb-1">Settings</h2>
        <p className="text-[14px] text-[var(--text-muted)]">
          Manage your account preferences and team members.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">

        <nav className="w-full md:w-56 flex flex-col gap-1">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={User}
            label="My Profile"
          />
          <TabButton
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            icon={Lock}
            label="Security"
          />
          <TabButton
            active={activeTab === 'apiKeys'}
            onClick={() => setActiveTab('apiKeys')}
            icon={Key}
            label="API Keys (BYOK)"
          />
          {user?.role === 'admin' && (
            <TabButton
              active={activeTab === 'team'}
              onClick={() => setActiveTab('team')}
              icon={Shield}
              label="Team Management"
            />
          )}
          <div className="mt-4 pt-4 border-t border-[var(--bg-hover)]">
            <TabButton
              onClick={logout}
              icon={LogOut}
              label="Sign Out"
              className="text-[var(--badge-red-text)] hover:bg-[var(--badge-red-bg)]"
            />
          </div>
        </nav>

        <div className="flex-1 bg-[var(--bg)] rounded-xl border border-[var(--bg-hover)] overflow-hidden shadow-[var(--sh-card)]">
          {activeTab === 'profile' && <ProfileSettings user={user} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'apiKeys' && <ApiKeySettings />}
          {activeTab === 'team' && <TeamSettings adminUser={user} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-[var(--text-primary)] text-[var(--bg)]'
          : 'text-[var(--text-body)] hover:bg-[var(--bg-hover)]'
      } ${className}`}
      style={{ border: 'none', cursor: 'pointer' }}
    >
      <Icon size={16} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function ProfileSettings({ user }) {
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSuccess(true);
    setIsUpdating(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6">
      <h4 className="mb-6">Profile Information</h4>
      <form onSubmit={handleUpdate} className="flex flex-col gap-6 max-w-md">
        <div className="flex items-center gap-6 mb-2">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.avatarSeed || user?.email}`}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl border-2 border-[var(--bg-hover)]"
          />
          <div className="flex flex-col gap-2">
            <button type="button" className="btn-secondary text-xs py-1.5 px-3">
              Change Avatar
            </button>
            <p className="text-[11px] text-[var(--text-muted)]">
              JPG, GIF or PNG. Max size of 2MB.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5 opacity-60">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Email Address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]" />
            <input type="email" value={user?.email} disabled className="w-full pl-9 cursor-not-allowed" />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] italic">Email cannot be changed yet.</p>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <button type="submit" disabled={isUpdating} className="btn-primary px-6">
            {isUpdating ? <RefreshCw size={14} className="animate-spin mr-2" /> : null}
            Save Changes
          </button>
          {success && (
            <span className="flex items-center gap-1 text-[12px] text-[var(--badge-green-text)] font-medium">
              <CheckCircle size={14} /> Updated
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="p-6">
      <h4 className="mb-6">Security & Password</h4>
      <div className="flex flex-col gap-6 max-w-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Current Password</label>
          <input type="password" placeholder="••••••••" className="w-full" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">New Password</label>
          <input type="password" placeholder="••••••••" className="w-full" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Confirm New Password</label>
          <input type="password" placeholder="••••••••" className="w-full" />
        </div>

        <div className="pt-2">
          <button className="btn-primary px-6">Update Password</button>
        </div>

        <div className="mt-8 p-4 rounded-xl border border-[var(--badge-red-bg)] bg-[var(--badge-red-bg)] bg-opacity-10">
          <h5 className="text-[var(--badge-red-text)] mb-2 flex items-center gap-2 text-sm">
            <AlertCircle size={14} /> Danger Zone
          </h5>
          <p className="text-[12px] text-[var(--text-body)] mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="text-[var(--badge-red-text)] border border-[var(--badge-red-text)] bg-transparent px-3 py-1.5 rounded-md text-[12px] font-semibold hover:bg-[var(--badge-red-text)] hover:text-white transition-colors cursor-pointer">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamSettings({ adminUser }) {
  const [members] = useState([
    { id: 1, name: adminUser.name, email: adminUser.email, role: 'admin', status: 'active' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@picket.hr', role: 'recruiter', status: 'active' },
    { id: 3, name: 'Mike Ross', email: 'mike@picket.hr', role: 'recruiter', status: 'invited' },
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h4>Team Management</h4>
        <button className="btn-primary py-1.5 px-3 text-xs gap-1.5">
          <UserPlus size={14} /> Invite Member
        </button>
      </div>

      <div className="overflow-hidden border border-[var(--bg-hover)] rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              <th className="px-4 py-3 text-left">Member</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {members.map((member) => (
              <tr key={member.id} className="border-t border-[var(--bg-hover)]">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--text-primary)]">{member.name}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{member.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{member.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'active'
                        ? 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]'
                        : 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]'
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 text-[var(--text-placeholder)] hover:text-[var(--badge-red-text)] transition-colors bg-transparent border-none cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiKeySettings() {
  const [keys, setKeys] = useState({
    gemini: '',
    groq: '',
    tavily: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/api/auth/settings')
      .then(res => {
        if (res.data?.settings?.apiKeys) {
          setKeys(res.data.settings.apiKeys);
        }
      })
      .catch(err => console.error('Failed to load settings', err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put('/api/auth/settings', { apiKeys: keys });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h4 className="mb-6">Integrate Your Own API Keys</h4>
      <p className="text-xs text-[var(--text-muted)] mb-6">
        Optionally bring your own API keys. If provided, Picket agents will use your keys and quotas. If left blank, Picket will run on platform default keys.
      </p>

      <form onSubmit={handleUpdate} className="flex flex-col gap-6 max-w-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Gemini API Key</label>
          <input
            type="password"
            value={keys.gemini}
            placeholder={keys.gemini ? "••••••••••••••••" : "AI Studio Gemini Key"}
            onChange={e => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Groq API Key</label>
          <input
            type="password"
            value={keys.groq}
            placeholder={keys.groq ? "••••••••••••••••" : "gsk_... Key"}
            onChange={e => setKeys(prev => ({ ...prev, groq: e.target.value }))}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Tavily API Key</label>
          <input
            type="password"
            value={keys.tavily}
            placeholder={keys.tavily ? "••••••••••••••••" : "tvly-... Key"}
            onChange={e => setKeys(prev => ({ ...prev, tavily: e.target.value }))}
            className="w-full"
          />
        </div>

        <div className="pt-2 flex items-center gap-4">
          <button type="submit" disabled={isUpdating} className="btn-primary px-6">
            {isUpdating ? <RefreshCw size={14} className="animate-spin mr-2" /> : null}
            Save Keys
          </button>
          {success && (
            <span className="flex items-center gap-1 text-[12px] text-[var(--badge-green-text)] font-medium">
              <CheckCircle size={14} /> Updated Settings
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
