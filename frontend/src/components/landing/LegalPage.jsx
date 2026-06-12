import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

export default function LegalPage({ initialTab = 'privacy', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'security', label: 'Security Policy', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-neutral-100 sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </button>
          <div onClick={onBack} className="flex items-center gap-2 cursor-pointer">
            <svg width="20" height="24" viewBox="0 0 44 54" fill="none">
              <defs>
                <linearGradient id="legal-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
                <linearGradient id="legal-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#26C6DA" />
                  <stop offset="100%" stopColor="#1565C0" />
                </linearGradient>
              </defs>
              <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#legal-g-back)" transform="rotate(14 12.5 26)" />
              <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#legal-g-front)" transform="rotate(-6 27.5 22)" />
            </svg>
            <span className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.6px' }}>picket</span>
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider text-[9px]">
              Legal Portal
            </span>
          </div>
        </div>
        <button onClick={onBack} className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
          Exit Portal
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[1200px] mx-auto w-full">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-100 p-6 shrink-0 space-y-1">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-4 px-2">
            Legal & Compliance
          </span>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  active 
                    ? 'bg-neutral-950 text-white shadow-sm' 
                    : 'hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Scrollable Document Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 max-w-[760px] custom-scrollbar">
          {activeTab === 'privacy' && (
            <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">Privacy Policy</h1>
                <p className="text-xs text-neutral-400">Last updated: June 12, 2026</p>
              </div>

              <p>
                At Picket, we are committed to protecting the privacy of candidates and recruiting teams alike. This policy describes how we collect, process, and safeguard data in connection with the Picket verification pipeline and Proof of Work system.
              </p>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">1. Data We Collect</h2>
                <p>
                  To perform background verifications, Picket collects specific candidate details provided by recruiters or the applicants themselves:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-500">
                  <li><strong>Resume Text & Metadata:</strong> Contact information, employment history, education, and credentials uploaded to our secure workspaces.</li>
                  <li><strong>Digital Footprint Identifiers:</strong> Public URLs (e.g. GitHub, LinkedIn) used to cross-verify CV skill claims.</li>
                  <li><strong>Proof of Work Telemetry:</strong> Typing rhythm speed (keystroke interval latency), backspace events, and paste detections gathered during interactive logic challenges.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">2. How We Process Data</h2>
                <p>
                  Candidate data is processed to detect synthetic applicant activity and evaluate candidate origin:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-500">
                  <li><strong>Synthetic Pattern Analysis:</strong> Resumes are analyzed via secure AI integrations to catch template copying and prompt injections.</li>
                  <li><strong>Biometric Validation:</strong> Telemetry is processed on our servers to evaluate the likelihood of automated script inputs. We do <strong>not</strong> collect or store keystroke content—only the intervals and copy-paste signals.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">3. Retention & GDPR Compliance</h2>
                <p>
                  We retain candidate files for 90 days or until deleted by the workspace owner. Workspace owners can purge any candidate record or project at any time. We support standard GDPR Right-to-Erasure requests for candidates.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">Terms of Service</h1>
                <p className="text-xs text-neutral-400">Last updated: June 12, 2026</p>
              </div>

              <p>
                By accessing Picket, you agree to comply with our usage terms. These terms outline user obligations, usage limitations, and liabilities concerning candidate screening.
              </p>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">1. Recruiter Responsibilities</h2>
                <p>
                  Workspace owners are solely responsible for ensuring they have the consent or legal grounds to process candidate resumes under local labor laws. Picket functions as a data processor on behalf of the recruiter.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">2. Permitted Use</h2>
                <p>
                  You may not use Picket to scrape candidate profiles or attempt to reverse-engineer our telemetry engines. Proof of Work challenges must only be sent to legitimate applicants applying for open roles inside your workspace.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">3. Liability Limits</h2>
                <p>
                  Picket's verification reports (including Bot Index and status ratings) are recommendations based on statistical behavioral telemetry. Picket is not responsible for ultimate hiring decisions or any claims related to applicant screening results.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">Security Policy</h1>
                <p className="text-xs text-neutral-400">Last updated: June 12, 2026</p>
              </div>

              <p>
                Picket employs industry-standard security architectures to protect recruiter assets and candidate details. Below is an overview of our security mechanisms.
              </p>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">1. Data Encryption</h2>
                <p>
                  All data is encrypted in transit and at rest:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-500">
                  <li><strong>In Transit:</strong> Encrypted using TLS 1.3 for all HTTP connections and live WebSockets.</li>
                  <li><strong>At Rest:</strong> Databases and uploaded resume storage use AES-256 encryption.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">2. Bring Your Own Key (BYOK) Isolation</h2>
                <p>
                  Recruiters can supply their own API keys for Google Gemini, Tavily, and Groq. Keys are encrypted client-side using industry standards before being stored securely on our database, ensuring no unauthorized access or leakage.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">3. Infrastructure Security</h2>
                <p>
                  Background tasks are processed within secure isolation containers. BullMQ workers run in restricted sandboxes, separating tenant memory domains so pipeline code runs securely.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
