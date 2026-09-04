import React, { useState, useMemo } from 'react';
import {
  BookOpen, Briefcase, UploadCloud, ShieldCheck, Activity, Sparkles, HelpCircle,
  Search, ArrowLeft, Lightbulb
} from 'lucide-react';

export default function DocsPage({ initialSection = 'welcome', onBack }) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  const docSections = useMemo(() => [
    {
      id: 'welcome',
      title: 'Welcome to Picket',
      icon: BookOpen,
      keywords: 'welcome start picket introduction overview resume fraud ai generation benefit hiring recruiter',
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Welcome to Picket</h1>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              Picket is an automated candidate verification and screening platform designed for modern recruiting teams. We help you filter out synthetic candidates, auto-generated resumes, and AI-plagiarized credentials so you can focus your interviews on real, high-signal human talent.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex gap-3.5">
            <ShieldCheck size={20} className="text-[#10b981] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">Why Picket?</span>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Generative AI tools make it easy for bots and bad actors to mass-produce resumes tailored to job descriptions. Picket works in the background to automatically identify these synthetic applicants before they schedule calls with your team.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Key Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Save Interview Hours</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Eliminate time wasted on applicants who use prompt-injection tricks or fabricated histories to bypass initial resume screens.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Interactive Verification</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Verify developer credentials with quick, custom reasoning challenges that capture typing behavior to prove human origin.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'workspaces',
      title: 'Projects & Workspaces',
      icon: Briefcase,
      keywords: 'projects workspace setup settings department location headcount api keys byok',
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Projects & Workspaces</h1>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              In Picket, everything starts with a **Project**. A Project is a dedicated screening workspace for a specific job opening.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Setting Up a Project</h2>
            <ol className="space-y-3.5 text-sm text-[var(--text-body)]">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">1</span>
                <span>Click <strong>New Project</strong> on your dashboard.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">2</span>
                <span>Enter details like the <strong>Job Title</strong>, <strong>Department</strong>, and <strong>Location</strong>.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">3</span>
                <span>Provide a <strong>Description</strong> detailing target skills (e.g. <i>React, Python, Node.js</i>). Picket uses these skills to generate context-relevant proof-of-work challenges.</span>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Centralized Agent Inference</h2>
            <p className="text-sm text-[var(--text-body)] leading-relaxed mb-3">
              Picket's backend handles all LLM inference automatically, so you don't need to configure your own API keys. Picket uses:
            </p>
            <ul className="space-y-2 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)]">
              <li>• <strong>Google Gemini 2.0:</strong> Powers the synthetic profile detector and social footprint audit (Free Tier).</li>
              <li>• <strong>Tavily Search:</strong> Powers the social footprint crawler to verify candidate claims online.</li>
              <li>• <strong>Llama 3.3:</strong> Powers the dynamic logic challenges generated for your candidates (Free Tier).</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'screening',
      title: 'Ingestion & Screening Feed',
      icon: UploadCloud,
      keywords: 'upload ingest resume pdf docx pipeline real time socket candidates stream list',
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Ingesting Candidates</h1>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              Once your project workspace is active, you can begin uploading candidate files directly to start the background verification pipeline.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">How to Screen a Candidate</h2>
            <ol className="space-y-3.5 text-sm text-[var(--text-body)]">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">1</span>
                <span>Open your Project workspace and click <strong>Upload Candidate</strong>.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">2</span>
                <span>Enter the candidate's <strong>Full Name</strong> and <strong>Email Address</strong>.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">3</span>
                <span>Drag and drop their resume file (PDF or DOCX format).</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--badge-blue-bg)] flex items-center justify-center font-mono font-bold text-xs text-[var(--badge-blue-text)] shrink-0 mt-0.5">4</span>
                <span>Click <strong>Upload</strong>. The background pipeline starts immediately.</span>
              </li>
            </ol>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--badge-pink-bg)]/20 flex gap-3.5">
            <Lightbulb size={20} className="text-[var(--badge-pink-text)] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono font-bold text-[var(--badge-pink-text)] uppercase tracking-wider block mb-1">Real-Time Updates</span>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                You do not need to refresh the page. The dashboard uses real-time WebSockets to automatically update candidate cards and confidence scores the moment background agents finish compiling their audits.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'statuses',
      title: 'Interpreting Signals',
      icon: Activity,
      keywords: 'signals status bot index high signal high noise audit required rejected verification metrics',
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Interpreting Verification Signals</h1>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              Every screened candidate is evaluated on a unified scale. Picket flags suspicious behaviors and highlights high-signal candidates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Understanding Pipeline Statuses</h2>
            <div className="space-y-3">
              {[
                {
                  status: 'High Signal',
                  color: 'text-[var(--badge-green-text)] bg-[var(--badge-green-bg)]',
                  desc: 'The resume shows organic language patterns, and online claims successfully match digital footprints. Low synthetic probability.'
                },
                {
                  status: 'Audit Required',
                  color: 'text-[var(--badge-blue-text)] bg-[var(--badge-blue-bg)]',
                  desc: 'Minor inconsistencies detected (e.g. social footprint match has low confidence, or slight AI writing indicators). We suggest reviewing this profile manually or waiting for the Proof of Work challenge result.'
                },
                {
                  status: 'High Noise',
                  color: 'text-[var(--badge-red-text)] bg-[var(--badge-red-bg)]',
                  desc: 'Highly likely to be a bot or synthetic applicant. The resume matches standard AI templates or prompt-injection text blocks were discovered.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] flex items-start gap-3.5">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 mt-0.5 ${item.color}`}>
                    {item.status}
                  </span>
                  <p className="text-xs text-[var(--text-body)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">The Bot Index</h2>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              The <strong>Bot Index (0% to 100%)</strong> indicates the likelihood that an applicant is synthetic. High scores suggest generative templates, copy-paste application spamming, or automated resume hacks.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'pow',
      title: 'Proof of Work (PoW) Guide',
      icon: Sparkles,
      keywords: 'proof of work challenge telemetry biometric latency clipboard paste entropy email candidate',
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Proof of Work (PoW)</h1>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              Proof of Work (PoW) is Picket's interactive verification filter. When a candidate's resume analysis falls into the "Audit Required" zone, Picket emails them a custom, lightweight reasoning challenge.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">What the Candidate Experiences</h2>
            <ul className="space-y-3.5 text-sm text-[var(--text-body)]">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--badge-blue-text)] mt-2 shrink-0" />
                <span><strong>Email Notification:</strong> The candidate receives a unique link asking them to complete a quick skills check.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--badge-blue-text)] mt-2 shrink-0" />
                <span><strong>Targeted Reasoning Challenge:</strong> They are presented with a simple puzzle or logic question based on their resume skills.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--badge-blue-text)] mt-2 shrink-0" />
                <span><strong>No Setup Required:</strong> The challenge opens directly in the web browser, takes less than 2 minutes, and does not require third-party tool installations.</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-3">How We Verify Human Origin</h2>
            <p className="text-sm text-[var(--text-body)] leading-relaxed mb-3">
              As the candidate solves the challenge, Picket records background telemetry metrics to differentiate humans from automated scripts:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Keystroke Latency</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Measures typing speed variations. Robotic consistency or sub-millisecond keypresses indicate scripted inputs.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Clipboard Paste Blocker</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Flags if the entire answer was copied and pasted instantly from ChatGPT or notes instead of organic typing.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Behavioral Entropy</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Evaluates natural rhythm anomalies and correction patterns (like backspaces) typical of human thought processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usability',
      title: 'Recruiter Best Practices',
      icon: HelpCircle,
      keywords: 'best practices recruiter tips workspace optimization verification candidate flow audit',
      content: (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-2">Recruiter Best Practices</h1>
            <p className="text-sm text-[var(--text-body)] leading-relaxed">
              Maximize the efficiency of your candidate screening workflow with these system recommendations.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Be Specific in Project Descriptions',
                desc: 'The skills and technology stack list inside your Project description directly influence the logic challenges generated for your applicants. Provide clear, precise technical keywords to ensure relevant challenge generation.'
              },
              {
                title: 'Review the Candidate Audit Trail',
                desc: 'Click on any candidate card in the pipeline table to slide open their detailed drawer view. Here, you can review the specific actions taken by the Detector and OSINT agents, and read the verified claims report.'
              },
              {
                title: 'Monitor Verification Status',
                desc: 'Keep an eye on the Bot Index score as it populates. High noise candidates can often be rejected outright, saving your team hours of manual screening time.'
              }
            ].map((tip, i) => (
              <div key={i} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{tip.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ], []);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docSections;
    const q = searchQuery.toLowerCase();
    return docSections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.keywords.includes(q)
    );
  }, [searchQuery, docSections]);

  const currentSection = docSections.find(s => s.id === activeSection) || docSections[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>

      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg)]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Back to previous page"
          >
            <ArrowLeft size={16} />
          </button>

          <div onClick={onBack} className="flex items-center gap-2 cursor-pointer">
            <svg width="20" height="24" viewBox="0 0 44 54" fill="none">
              <defs>
                <linearGradient id="docs-pk-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
                <linearGradient id="docs-pk-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#26C6DA" />
                  <stop offset="100%" stopColor="#1565C0" />
                </linearGradient>
              </defs>
              <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#docs-pk-g-back)" transform="rotate(14 12.5 26)" />
              <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#docs-pk-g-front)" transform="rotate(-6 27.5 22)" />
            </svg>
            <span className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.6px' }}>picket</span>
            <span className="text-xs bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider text-[9px]">
              User Guide
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Exit Guide
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col p-4 shrink-0 hidden md:flex">

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]" size={14} />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs w-full bg-[var(--bg)] border border-[var(--border-color)] rounded-lg outline-none focus:ring-1 focus:ring-[var(--badge-blue-text)]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
            <span className="text-[10px] font-mono font-bold text-[var(--text-placeholder)] uppercase tracking-widest px-2 block mb-2">
              Help Center
            </span>
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const active = sec.id === activeSection;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-150 ${
                    active
                      ? 'bg-[var(--text-primary)] text-[var(--bg)] font-semibold'
                      : 'hover:bg-[var(--bg-hover)] text-[var(--text-body)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
            {filteredSections.length === 0 && (
              <span className="text-[11px] text-[var(--text-muted)] px-3 block">No topics match query</span>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg)] p-6 md:p-12">

          <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2 border-b border-[var(--border-color)] custom-scrollbar">
            {filteredSections.map((sec) => {
              const active = sec.id === activeSection;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-[var(--text-primary)] text-[var(--bg)] font-semibold'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {sec.title}
                </button>
              );
            })}
          </div>
          <div className="max-w-[760px] mx-auto pb-24">
            {currentSection.content}
          </div>
        </main>
      </div>
    </div>
  );
}
