import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { 
  Eye, EyeOff, BookOpen, ExternalLink, 
  CheckCircle2, XCircle, LogOut, ArrowRight, Loader 
} from 'lucide-react';

export default function ApiKeyOnboarding() {
  const { logout, refreshUser } = useAuth();
  const [keys, setKeys] = useState({
    gemini: '',
    groq: '',
    tavily: ''
  });
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    groq: false,
    tavily: false
  });
  const [activeGuideTab, setActiveGuideTab] = useState('gemini');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Local validation helper
  const validateKey = (name, val) => {
    if (!val) return null;
    if (name === 'gemini') return val.startsWith('AIzaSy') && val.length >= 30;
    if (name === 'groq') return val.startsWith('gsk_') && val.length >= 30;
    if (name === 'tavily') return val.startsWith('tvly-') && val.length >= 20;
    return true;
  };

  const isFormValid = 
    validateKey('gemini', keys.gemini) &&
    validateKey('groq', keys.groq) &&
    validateKey('tavily', keys.tavily);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isFormValid) {
      setError('Please provide valid API keys. See the guides on the right.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put('/api/auth/settings', { apiKeys: keys });
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save settings. Please try again.');
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = (name) => {
    setShowKeys(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[var(--bg)]" style={{ color: 'var(--text-primary)' }}>
      {/* Left side: Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 lg:p-16 max-w-xl border-r border-[var(--border-color)]">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-2 mb-8">
            <svg
              width="24" height="30" viewBox="0 0 44 54" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <defs>
                <linearGradient id="pk-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
                <linearGradient id="pk-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#26C6DA" />
                  <stop offset="100%" stopColor="#1565C0" />
                </linearGradient>
              </defs>
              <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#pk-g-back)" transform="rotate(14 12.5 26)" />
              <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#pk-g-front)" transform="rotate(-6 27.5 22)" />
            </svg>
            <span className="font-bold text-lg tracking-tight">picket</span>
          </div>

          <h2 className="mb-3 text-2xl font-semibold tracking-tight">Setup Your Workspace</h2>
          <p className="text-sm text-[var(--text-body)] mb-8 leading-relaxed">
            Picket is a candidate screening system utilizing agentic LLMs and OSINT tools.
            To begin, enter your own API keys below. Picket executes secure backend calls directly to these endpoints.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div 
                className="flex items-center gap-2 p-3.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--badge-red-bg)', color: 'var(--badge-red-text)' }}
              >
                <XCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Gemini Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-semibold flex items-center gap-1.5">
                  Gemini API Key
                </label>
                <button 
                  type="button" 
                  onClick={() => setActiveGuideTab('gemini')}
                  className="text-[11px] font-semibold text-[var(--badge-blue-text)] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Guide
                </button>
              </div>
              <div className="relative">
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={keys.gemini}
                  onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value.trim() }))}
                  placeholder="AIzaSy... Gemini Key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('gemini')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] hover:text-[var(--text-primary)] bg-transparent border-none"
                >
                  {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <KeyValidationStatus 
                isValid={validateKey('gemini', keys.gemini)} 
                formatText="Should start with 'AIzaSy' (30+ characters)"
              />
            </div>

            {/* Groq Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-semibold flex items-center gap-1.5">
                  Groq API Key
                </label>
                <button 
                  type="button" 
                  onClick={() => setActiveGuideTab('groq')}
                  className="text-[11px] font-semibold text-[var(--badge-blue-text)] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Guide
                </button>
              </div>
              <div className="relative">
                <input
                  type={showKeys.groq ? 'text' : 'password'}
                  value={keys.groq}
                  onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value.trim() }))}
                  placeholder="gsk_... Groq Key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('groq')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] hover:text-[var(--text-primary)] bg-transparent border-none"
                >
                  {showKeys.groq ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <KeyValidationStatus 
                isValid={validateKey('groq', keys.groq)} 
                formatText="Should start with 'gsk_' (30+ characters)"
              />
            </div>

            {/* Tavily Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-semibold flex items-center gap-1.5">
                  Tavily API Key
                </label>
                <button 
                  type="button" 
                  onClick={() => setActiveGuideTab('tavily')}
                  className="text-[11px] font-semibold text-[var(--badge-blue-text)] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Guide
                </button>
              </div>
              <div className="relative">
                <input
                  type={showKeys.tavily ? 'text' : 'password'}
                  value={keys.tavily}
                  onChange={(e) => setKeys(prev => ({ ...prev, tavily: e.target.value.trim() }))}
                  placeholder="tvly-... Tavily Key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('tavily')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] hover:text-[var(--text-primary)] bg-transparent border-none"
                >
                  {showKeys.tavily ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <KeyValidationStatus 
                isValid={validateKey('tavily', keys.tavily)} 
                formatText="Should start with 'tvly-' (20+ characters)"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="btn-primary w-full py-3 justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin" /> Saving Workspace...
                </>
              ) : (
                <>
                  Save & Launch Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer actions */}
        <div className="pt-8 border-t border-[var(--border-color)] mt-12 flex justify-between items-center text-xs">
          <span className="text-[var(--text-muted)]">Locked Workspace Session</span>
          <button 
            onClick={logout}
            className="flex items-center gap-1.5 text-[var(--badge-red-text)] font-semibold hover:underline bg-transparent border-none"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Right side: Interactive Keys Guide */}
      <div className="flex-1 bg-[var(--bg-surface)] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] rounded-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-base leading-tight">API Key Acquisition Guide</h4>
              <p className="text-[12px] text-[var(--text-muted)]">Step-by-step instructions on obtaining credentials</p>
            </div>
          </div>

          {/* Guide Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[var(--border-color)] pb-2">
            <GuideTabButton 
              active={activeGuideTab === 'gemini'} 
              onClick={() => setActiveGuideTab('gemini')}
              label="Gemini"
            />
            <GuideTabButton 
              active={activeGuideTab === 'groq'} 
              onClick={() => setActiveGuideTab('groq')}
              label="Groq"
            />
            <GuideTabButton 
              active={activeGuideTab === 'tavily'} 
              onClick={() => setActiveGuideTab('tavily')}
              label="Tavily"
            />
          </div>

          {/* Guide Tab Contents */}
          <div className="min-h-[260px]">
            {activeGuideTab === 'gemini' && (
              <div className="animate-fadeIn">
                <h5 className="font-semibold text-sm mb-3 flex items-center justify-between">
                  <span>Google AI Studio (Gemini API)</span>
                  <a 
                    href="https://aistudio.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--badge-blue-text)] flex items-center gap-1 hover:underline"
                  >
                    Open AI Studio <ExternalLink size={12} />
                  </a>
                </h5>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-[var(--text-body)] leading-relaxed">
                  <li>Visit the <strong>Google AI Studio</strong> dashboard page.</li>
                  <li>Sign in using any Google account.</li>
                  <li>Click on the <strong>"Get API Key"</strong> button located in the left navigation sidebar.</li>
                  <li>Click <strong>"Create API key"</strong>, select either a new or existing Google Cloud project.</li>
                  <li>Copy your newly created key. It must begin with <code className="font-mono text-[var(--badge-blue-text)] font-semibold">AIzaSy</code>.</li>
                </ol>
                <div className="mt-5 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[11px] text-[var(--text-muted)]">
                  💡 <strong>Tip:</strong> The Gemini API has a generous free tier of up to 15 Requests Per Minute (RPM) which is plenty for evaluation.
                </div>
              </div>
            )}

            {activeGuideTab === 'groq' && (
              <div className="animate-fadeIn">
                <h5 className="font-semibold text-sm mb-3 flex items-center justify-between">
                  <span>Groq Console (Llama & DeepSeek)</span>
                  <a 
                    href="https://console.groq.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--badge-blue-text)] flex items-center gap-1 hover:underline"
                  >
                    Open Groq Console <ExternalLink size={12} />
                  </a>
                </h5>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-[var(--text-body)] leading-relaxed">
                  <li>Visit the <strong>Groq Console</strong> platform.</li>
                  <li>Register a developer profile or login.</li>
                  <li>Under the main sidebar menu, select the <strong>"API Keys"</strong> tab.</li>
                  <li>Click <strong>"Create API Key"</strong>, assign it a name like <i>"Picket-Agents"</i>, and confirm.</li>
                  <li>Copy the key immediately. It starts with <code className="font-mono text-[var(--badge-blue-text)] font-semibold">gsk_</code>.</li>
                </ol>
                <div className="mt-5 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[11px] text-[var(--text-muted)]">
                  💡 <strong>Tip:</strong> Picket uses Groq to generate interactive logic challenges for candidates in milliseconds.
                </div>
              </div>
            )}

            {activeGuideTab === 'tavily' && (
              <div className="animate-fadeIn">
                <h5 className="font-semibold text-sm mb-3 flex items-center justify-between">
                  <span>Tavily AI (OSINT Search Engine)</span>
                  <a 
                    href="https://tavily.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--badge-blue-text)] flex items-center gap-1 hover:underline"
                  >
                    Open Tavily Dashboard <ExternalLink size={12} />
                  </a>
                </h5>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-[var(--text-body)] leading-relaxed">
                  <li>Visit the <strong>Tavily AI</strong> landing page and sign up.</li>
                  <li>Register a developer account. It includes 1,000 free search API credits monthly.</li>
                  <li>Look directly at the top header of your dashboard home screen to locate your token.</li>
                  <li>Copy the key. It starts with <code className="font-mono text-[var(--badge-blue-text)] font-semibold">tvly-</code>.</li>
                </ol>
                <div className="mt-5 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[11px] text-[var(--text-muted)]">
                  💡 <strong>Tip:</strong> Tavily is used by the OSINT agent to perform automated background fact-checking across candidates' web footprints.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideTabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md border-none ${
        active 
          ? 'bg-[var(--text-primary)] text-[var(--bg)]' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      }`}
      style={{ cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}

function KeyValidationStatus({ isValid, formatText }) {
  if (isValid === null) {
    return (
      <span className="text-[11px] text-[var(--text-placeholder)] mt-0.5">
        {formatText}
      </span>
    );
  }

  if (isValid) {
    return (
      <span className="text-[11px] text-[var(--badge-green-text)] flex items-center gap-1 mt-0.5 font-medium">
        <CheckCircle2 size={12} /> Key format looks valid.
      </span>
    );
  }

  return (
    <span className="text-[11px] text-[var(--badge-red-text)] flex items-center gap-1 mt-0.5 font-medium">
      <XCircle size={12} /> Invalid key format. {formatText}
    </span>
  );
}
