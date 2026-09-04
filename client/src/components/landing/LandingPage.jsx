import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Shield, Globe, Brain, UploadCloud, CheckCircle,
  ChevronRight, Users, Play, Terminal, Activity, Zap, Check, ExternalLink,
  LayoutGrid, Kanban
} from 'lucide-react';
import PipelineGrid from '../PipelineGrid';
import PipelineBoard from '../PipelineBoard';
import '../../landing.css';

function LandingPipelineDemo() {
  const [viewMode, setViewMode] = useState('grid');
  const mockCandidates = [
    { _id: '1', name: 'Nadia Petrova', email: 'nadia.p@example.com', pipeline_status: 'high_signal', synthetic_probability: 0.12, submitted_at: new Date().toISOString(), agent_audit_trail: [{ agent_name: 'Detector', action: 'Verified organic text patterns', timestamp: Date.now() }], pow_data: null },
    { _id: '3', name: 'Aris Thorne', email: 'aris.t@example.com', pipeline_status: 'audit_required', synthetic_probability: 0.65, submitted_at: new Date(Date.now() - 7200000).toISOString(), agent_audit_trail: [{ agent_name: 'OSINT', action: 'Flagged footprint mismatch', timestamp: Date.now() }], pow_data: { completed: false } },
    { _id: '4', name: 'Marcus Vance', email: 'm.vance@example.com', pipeline_status: 'processing', synthetic_probability: 0.45, submitted_at: new Date().toISOString(), agent_audit_trail: [], pow_data: null },
    { _id: '2', name: 'Unknown Dev', email: 'dev99@proton.me', pipeline_status: 'high_noise', synthetic_probability: 0.89, submitted_at: new Date(Date.now() - 3600000).toISOString(), agent_audit_trail: [{ agent_name: 'OSINT', action: 'No public repos found', timestamp: Date.now() }], pow_data: null },
  ];

  return (
    <div data-pk-animate data-pk-delay="2" className="bg-white/40 backdrop-blur-md border border-neutral-200/60 p-5 rounded-2xl w-full" style={{ boxShadow: 'var(--sh-card-lg)' }}>
      <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-50 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Active Screening</span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
              Queue worker #3
            </span>
          </div>
          
          <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-0.5 shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold rounded transition-all ${viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-900'}`}>
              <LayoutGrid size={12} /> Grid
            </button>
            <button onClick={() => setViewMode('board')} className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold rounded transition-all ${viewMode === 'board' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-900'}`}>
              <Kanban size={12} /> Board
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden" style={{ maxHeight: '380px', overflowY: 'auto' }}>
          {viewMode === 'grid' ? (
            <PipelineGrid candidates={mockCandidates} />
          ) : (
            <PipelineBoard candidates={mockCandidates} />
          )}
        </div>
      </div>
    </div>
  );
}

function useIntersectionObserver() {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pk-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = containerRef.current?.querySelectorAll('[data-pk-animate], [data-pk-scale], .pk-connector');
    elements?.forEach((el) => observer.observe(el));

    return () => elements?.forEach((el) => observer.unobserve(el));
  }, []);

  return containerRef;
}

export default function LandingPage({ onStartHiring, onLogin, onDocs, onHowItWorks, onAIAgents, onFeatures, onDemo, onLegal }) {
  const containerRef = useIntersectionObserver();
  const [scrollY, setScrollY] = useState(0);

  const [typedText, setTypedText] = useState('');
  const [telemetry, setTelemetry] = useState({
    keystrokes: 0,
    pasteCount: 0,
    latencyList: [],
    avgLatency: 0,
    status: 'idle',
  });
  const lastKeyTimeRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleTrySandbox = () => {
    const textarea = document.getElementById('live-sandbox-textarea');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textarea.focus();
    }
  };

  const handleSandboxChange = (e) => {
    const val = e.target.value;
    const isPaste = Math.abs(val.length - typedText.length) > 4 && val.length > 0;

    if (isPaste) {
      setTelemetry(prev => {
        const nextList = [...prev.latencyList, -1].slice(-20);
        return {
          ...prev,
          pasteCount: prev.pasteCount + 1,
          latencyList: nextList,
          status: 'pasted'
        };
      });
    } else if (val.length > 0) {
      const now = Date.now();
      let latency = 0;
      if (lastKeyTimeRef.current) {
        latency = now - lastKeyTimeRef.current;
      }
      lastKeyTimeRef.current = now;

      setTelemetry(prev => {
        const nextList = [...prev.latencyList, latency].filter(l => l > 0).slice(-20);
        const avg = nextList.length ? nextList.reduce((a, b) => a + b, 0) / nextList.length : 0;
        return {
          ...prev,
          keystrokes: prev.keystrokes + 1,
          latencyList: nextList,
          avgLatency: Math.round(avg),
          status: 'typing'
        };
      });
    } else {
      setTelemetry(prev => ({ ...prev, status: 'idle' }));
    }
    setTypedText(val);
  };

  const handleSandboxReset = () => {
    setTypedText('');
    setTelemetry({
      keystrokes: 0,
      pasteCount: 0,
      latencyList: [],
      avgLatency: 0,
      status: 'idle',
    });
    lastKeyTimeRef.current = null;
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden selection:bg-[var(--picket-glow)] selection:text-[var(--picket-cyan)] bg-white text-neutral-900 relative" style={{ fontFamily: 'var(--font-sans)' }}>

      <div className="fixed inset-0 pointer-events-none opacity-40 z-0" style={{ backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(38,198,218,0.15) 0%, transparent 80%)' }} />

      <nav
        className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 md:px-6 transition-all duration-300"
      >
        <div
          className="flex items-center justify-between w-full max-w-[1200px] px-4 h-14 rounded-2xl border transition-all duration-300 shadow-lg shadow-black/5"
          style={{
            background: scrollY > 10 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: scrollY > 10 ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="24" height="28" viewBox="0 0 44 54" fill="none" className="shrink-0 transition-transform hover:scale-105 duration-300">
              <defs>
                <linearGradient id="nav-pk-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
                <linearGradient id="nav-pk-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#26C6DA" />
                  <stop offset="100%" stopColor="#1565C0" />
                </linearGradient>
              </defs>
              <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#nav-pk-g-back)" transform="rotate(14 12.5 26)" />
              <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#nav-pk-g-front)" transform="rotate(-6 27.5 22)" />
            </svg>
            <span className="font-bold text-[18px] tracking-tight" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.8px' }}>picket</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-neutral-100/50 p-1 rounded-xl border border-neutral-200/50">
            {[
              { label: 'How it works', onClick: onHowItWorks },
              { label: 'AI Agents', onClick: onAIAgents },
              { label: 'Features', onClick: onFeatures },
              { label: 'Docs', onClick: onDocs }
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="text-neutral-600 hover:text-neutral-900 hover:bg-white text-[13px] font-medium px-4 py-1.5 rounded-lg transition-all duration-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onLogin} className="text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100">
              Log in
            </button>
            <button
              onClick={onStartHiring}
              className="group flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Hiring
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5 duration-200" />
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden z-10">

        <div className="max-w-[1200px] mx-auto relative z-10">

          <div
            data-pk-animate
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(38,198,218,0.2)]"
            style={{ background: 'rgba(38, 198, 218, 0.05)', color: '#26C6DA', fontSize: '11px', fontWeight: 600, letterSpacing: '-0.1px' }}
          >
          </div>

          <h1
            data-pk-animate
            data-pk-delay="1"
            className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[0.95]"
            style={{ letterSpacing: '-2.8px' }}
          >
            The <span className="gradient-text">Synthetic</span> <br/> Recruiter.
          </h1>

          <p
            data-pk-animate
            data-pk-delay="2"
            className="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
          >
            Stop wasting interview cycles on synthetic applicants. Automatically verify candidate skills, check online profiles, and ensure real humans - not bots - are applying to your jobs.
          </p>

          <div
            data-pk-animate
            data-pk-delay="3"
            className="flex flex-col sm:flex-row justify-center items-center gap-3.5 mt-10"
          >
            <button
              onClick={onStartHiring}
              className="w-full sm:w-auto bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:-translate-y-0.5"
            >
              Start Hiring Free
            </button>
            <button
              onClick={onDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md text-neutral-800 hover:text-neutral-900 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border border-neutral-200 shadow-sm hover:border-neutral-300 hover:bg-white cursor-pointer"
            >
              <Play size={14} className="fill-current" />
              Watch Demo
            </button>

          </div>

          <p data-pk-animate data-pk-delay="4" className="mt-6 text-[12px] text-neutral-600 font-medium tracking-wide">
            Zero friction integrations · Setup in 2 mins · 50 Free credits
          </p>

          <div
            data-pk-animate
            data-pk-delay="4.5"
            className="mt-12 max-w-xl mx-auto rounded-xl p-6 border text-left bg-white/70 backdrop-blur-md"
            style={{
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--sh-card)',
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Try It Live: Typing Detection
              </span>
              {(typedText.length > 0 || telemetry.pasteCount > 0) && (
                <button
                  onClick={handleSandboxReset}
                  className="text-[10px] font-semibold hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Reset
                </button>
              )}
            </div>

            <p className="text-[12px] mb-3" style={{ color: 'var(--text-body)' }}>
              Type something below or paste a resume snippet to test our real-time behavioral audit:
            </p>

            <textarea
              id="live-sandbox-textarea"
              value={typedText}
              onChange={handleSandboxChange}
              placeholder="Start typing or copy-paste text here..."
              rows={3}

              style={{
                width: '100%',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--sh-ring)',
                border: 'none',
                outline: 'none',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}
            />

            <div className="grid grid-cols-3 gap-3 mt-4 text-[10px] font-mono">
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100 flex flex-col justify-between">
                <span className="text-neutral-400 uppercase tracking-widest text-[8px] font-bold">KEYSTROKES</span>
                <span className="font-extrabold text-neutral-900 text-xs mt-0.5">{telemetry.keystrokes}</span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100 flex flex-col justify-between">
                <span className="text-neutral-400 uppercase tracking-widest text-[8px] font-bold">PASTE EVENTS</span>
                <span className={`font-extrabold text-xs mt-0.5 ${telemetry.pasteCount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {telemetry.pasteCount}
                </span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100 flex flex-col justify-between">
                <span className="text-neutral-400 uppercase tracking-widest text-[8px] font-bold">AVERAGE SPEED</span>
                <span className="font-extrabold text-neutral-900 text-xs mt-0.5">{telemetry.avgLatency ? `${telemetry.avgLatency}ms` : '-'}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-3">
              <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-widest block mb-2">Live Typing Speed Analysis</span>
              <div className="h-10 flex items-end gap-[2px] bg-neutral-50 rounded-lg p-2 border border-neutral-150">
                {telemetry.latencyList.length === 0 ? (
                  <span className="text-[9px] text-neutral-400 font-mono italic m-auto">Start typing to draw graph...</span>
                ) : (
                  <div className="flex items-end gap-[3px] w-full h-full justify-start overflow-hidden">
                    {telemetry.latencyList.map((lat, idx) => {
                      const isPaste = lat === -1;
                      const maxVal = 400; // Cap height scaling at 400ms
                      const percent = isPaste ? 100 : Math.min(100, Math.max(15, (lat / maxVal) * 100));
                      return (
                        <div
                          key={idx}
                          className={`w-1.5 rounded-t-sm transition-all duration-150 shrink-0 ${isPaste ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}
                          style={{ height: `${percent}%` }}
                          title={isPaste ? 'Paste Event' : `${lat}ms`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[9px] text-neutral-400 font-mono">TYPING STATS</span>
              {telemetry.status === 'idle' && (
                <span className="text-[10px] font-bold text-neutral-500 font-mono">WAITING FOR INPUT...</span>
              )}
              {telemetry.status === 'typing' && (
                <span className="text-[10px] font-bold text-emerald-600 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> VERIFIED ORGANIC HUMAN
                </span>
              )}
              {telemetry.status === 'pasted' && (
                <span className="text-[10px] font-bold text-red-600 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> COPY-PASTE DETECTED
                </span>
              )}
            </div>
          </div>

          <div
            data-pk-scale
            data-pk-delay="5"
            className="relative max-w-[960px] mx-auto mt-20"
          >

            <div
              className="rounded-2xl border border-neutral-200/80 bg-white/60 backdrop-blur-2xl"
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 40px rgba(38,198,218,0.06)', overflow: 'hidden' }}
            >

              <div className="h-12 border-b border-neutral-200/80 px-4 flex items-center justify-between bg-white/40 backdrop-blur-md relative">
                <div className="flex items-center gap-1.5 z-10">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]/80 hover:bg-[#ff5f56] transition-colors cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]/80 hover:bg-[#ffbd2e] transition-colors cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]/80 hover:bg-[#27c93f] transition-colors cursor-pointer" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-[11px] text-neutral-500 font-medium font-mono flex items-center gap-1.5">
                    <Terminal size={12} className="text-neutral-400" /> picket-agent-console-v2
                  </div>
                </div>
                <div className="w-12 z-10" />
              </div>

              <div className="flex h-[460px] text-left text-neutral-800">

                <div className="w-56 border-r border-neutral-200/80 p-4 bg-neutral-50/50 hidden sm:flex flex-col gap-1.5">
                  <div className="px-3 py-2 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mt-1 mb-1">Workspace</div>
                  <div className="px-3 py-2 rounded-lg bg-white border border-neutral-200 shadow-sm text-neutral-900 text-xs font-semibold flex items-center gap-2.5">
                    <Activity size={14} className="text-[var(--picket-blue)]" /> Projects
                  </div>
                  <div className="px-3 py-2 rounded-lg text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 text-xs font-medium flex items-center gap-2.5 cursor-pointer transition-colors">
                    <Users size={14} /> Candidates
                  </div>
                  <div className="px-3 py-2 rounded-lg text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 text-xs font-medium flex items-center gap-2.5 cursor-pointer transition-colors">
                    <Terminal size={14} /> Agent Config
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-start overflow-hidden bg-white/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-neutral-900 mb-1">Verification Feed</h3>
                      <p className="text-xs text-neutral-500 font-medium">Parallel agent verification pipeline status</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shadow-sm">
                      <span className="pk-live-dot bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-700 font-mono tracking-wide">LIVE FEED</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: 'Sarah Jenkins', role: 'Staff Front-End Architect', prob: '0.4%', status: 'High Signal', bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
                      { name: 'David Kovalenko', role: 'DevOps Architect (AI Bot Pattern)', prob: '98.7%', status: 'High Noise', bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
                      { name: 'Rohan Mehra', role: 'Senior Python Engineer', prob: '1.2%', status: 'High Signal', bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
                      { name: 'Liam Sterling', role: 'Machine Learning Expert', prob: 'Analyzing...', status: 'Processing', bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', isPulse: true },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 border border-neutral-200/80 rounded-xl text-xs bg-white hover:bg-neutral-50 transition-all duration-200 hover:shadow-sm">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200/60 flex items-center justify-center font-bold text-neutral-600 text-sm shadow-inner">
                            {row.name[0]}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="font-semibold text-neutral-900">{row.name}</div>
                            <div className="text-[11px] text-neutral-500 font-medium">{row.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right hidden md:block">
                            <div className="font-semibold text-neutral-900 font-mono">{row.prob}</div>
                            <div className="text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5 font-bold">BOT INDEX</div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${row.isPulse ? 'pk-badge-pulse' : ''}`}
                            style={{ background: row.bg, borderColor: row.border, color: row.text }}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-[25%] -left-6 bg-white/95 backdrop-blur-xl p-4 rounded-xl border border-neutral-200/80 hidden lg:flex flex-col gap-1 shadow-xl max-w-[140px] transition-transform hover:-translate-y-1 duration-300 z-20">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Accuracy</span>
              <span className="text-2xl font-bold font-mono text-[var(--picket-blue)]">94.2%</span>
            </div>
            <div className="absolute bottom-[20%] -right-6 bg-white/95 backdrop-blur-xl p-4 rounded-xl border border-neutral-200/80 hidden lg:flex flex-col gap-1 shadow-xl max-w-[150px] transition-transform hover:-translate-y-1 duration-300 z-20">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Latency</span>
              <span className="text-lg font-bold font-mono text-neutral-900">4.8s per CV</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-y border-neutral-200 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-6">
            PROTECTING RECRUITING PIPELINES AT
          </p>
          <div className="pk-marquee-wrap">
            <div className="pk-marquee-track">
              {['Vercel', 'Linear', 'Cursor', 'Stripe', 'Perplexity', 'ChatGPT', 'Linear', 'Cursor', 'Stripe'].map((c, i) => (
                <span key={i} className="text-sm font-bold opacity-30 hover:opacity-75 transition-opacity tracking-widest uppercase font-mono px-4 text-neutral-800">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 max-w-[1200px] mx-auto text-center relative z-10">
        <div className="max-w-xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[var(--picket-blue)] uppercase tracking-wider">CORE PIPELINE</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mt-3">
            From upload to signal in seconds
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative">
          <div className="absolute top-[32px] left-[15%] right-[15%] h-[2px] bg-neutral-200 hidden md:block z-0" />

          <div data-pk-animate className="flex-1 flex flex-col items-center relative z-10 text-center">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-neutral-200 flex items-center justify-center mb-5 transition-transform hover:scale-105 duration-200" style={{ color: 'var(--step-ingest)' }}>
              <UploadCloud size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-1.5">STEP 01</span>
            <h3 className="text-lg font-bold tracking-tight text-neutral-900">Ingest CVs</h3>
            <p className="text-xs text-neutral-600 mt-2 max-w-[240px] leading-relaxed">Drag-drop or API. PDF, DOCX, LinkedIn exports are parsed instantly.</p>
          </div>

          <div className="pk-connector hidden md:block mt-7 z-10" />

          <div data-pk-animate data-pk-delay="1" className="flex-1 flex flex-col items-center relative z-10 text-center">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-neutral-200 flex items-center justify-center mb-5 transition-transform hover:scale-105 duration-200" style={{ color: 'var(--step-analyze)' }}>
              <Brain size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-1.5">STEP 02</span>
            <h3 className="text-lg font-bold tracking-tight text-neutral-900">Agents Analyze</h3>
            <p className="text-xs text-neutral-600 mt-2 max-w-[240px] leading-relaxed">Detector, OSINT, and PoW agents process candidate telemetry.</p>
          </div>

          <div className="pk-connector hidden md:block mt-7 z-10" />

          <div data-pk-animate data-pk-delay="2" className="flex-1 flex flex-col items-center relative z-10 text-center">
            <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-neutral-200 flex items-center justify-center mb-5 transition-transform hover:scale-105 duration-200" style={{ color: 'var(--step-signal)' }}>
              <CheckCircle size={22} />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-1.5">STEP 03</span>
            <h3 className="text-lg font-bold tracking-tight text-neutral-900">Signal Surfaces</h3>
            <p className="text-xs text-neutral-600 mt-2 max-w-[240px] leading-relaxed">Clean profiles match headcount seats; bot networks are locked out.</p>
          </div>
        </div>
      </section>

      <section id="ai-agents" className="py-24 px-6 bg-white/40 backdrop-blur-md border-y border-neutral-200 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[var(--picket-blue)] uppercase tracking-wider">VERIFICATION MECHANISMS</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mt-3">Three agents. One verdict.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tag: 'AGENT 01', icon: Shield, title: 'Resume Checker', desc: 'Scans resumes to catch AI-generated applications and fake credentials.', footer: 'OpenRouter Free Tier', color: '#db2777', bg: 'rgba(219, 39, 119, 0.1)' },
              { tag: 'AGENT 02', icon: Globe, title: 'Profile Checker', desc: "Searches the web to verify candidates' online profiles, portfolios, and work history.", footer: 'Tavily + OpenRouter API', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
              { tag: 'AGENT 03', icon: Brain, title: 'Skill Challenge', desc: 'Sends quick skill quizzes to ensure applicants are real humans who actually know their stuff.', footer: 'Llama 3.3 + Typing Stats', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' }
            ].map((agent, i) => (
              <div key={i} data-pk-animate data-pk-delay={i+1} className="bg-white p-6 rounded-xl border border-neutral-200 flex flex-col justify-between pk-card-hover" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider" style={{ background: agent.bg, color: agent.color }}>
                      {agent.tag}
                    </span>
                    <agent.icon className="pk-agent-icon" size={20} style={{ color: agent.color }} />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 mb-2">{agent.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-8">{agent.desc}</p>
                </div>
                <div className="text-[10px] font-mono text-neutral-500 pt-4 border-t border-neutral-100 flex justify-between uppercase">
                  <span>ENGINE</span>
                  <span className="font-semibold text-neutral-700">{agent.footer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div data-pk-animate className="text-left">
            <span className="text-xs font-mono font-bold text-[var(--picket-blue)] uppercase tracking-wider">INTERACTIVE FLOW</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mt-3 mb-6">Watch candidates get sorted.</h2>
            <p className="text-sm text-neutral-600 leading-relaxed mb-8">
              No manual validation needed. Watch live candidates stream back from the queue. Suspicious payloads are isolated immediately for human inspection.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Instant background screening',
                'Real-time candidate updates',
                'Clear human-or-bot confidence scores',
                'One-click candidate skill challenges'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-medium text-neutral-700">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleTrySandbox}
              className="flex items-center gap-1 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-4 py-2.5 rounded-lg text-xs border border-neutral-200 shadow-sm transition-all"
            >
              Try Picket Sandbox <ChevronRight size={14} />
            </button>

          </div>

          <LandingPipelineDemo />
        </div>
      </section>

      <section id="features" className="py-20 border-y border-neutral-900 bg-neutral-950 text-white">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '94.2%', label: 'Detection Accuracy' },
            { num: '3 Agents', label: 'Running Parallelized' },
            { num: '< 5s', label: 'Processing Latency' },
            { num: '100%', label: 'Immutable Audit Logs' }
          ].map((stat, i) => (
            <div key={i} data-pk-animate data-pk-delay={i} className="text-center md:text-left">
              <div
                className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2"
                style={{
                  letterSpacing: '-2px',
                  background: 'var(--picket-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {stat.num}
              </div>
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pow" className="py-24 px-6 text-center max-w-[720px] mx-auto relative z-10">
        <span className="text-xs font-mono font-bold text-[var(--badge-pink-text)] uppercase tracking-wider">PROOF OF WORK ENGINE</span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mt-3 mb-6">Real humans pass. Bots don't.</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-12">
          Picket automatically sends a lightweight interaction telemetry challenge when profile verification returns uncertain confidence. Bots fail immediately.
        </p>

        <div data-pk-animate className="bg-white p-6 rounded-2xl border border-neutral-200 text-left mx-auto max-w-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-100">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Active biometrics</span>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <Zap size={10} className="fill-current" /> Live challenge
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-900 mb-4 leading-relaxed">
            In a sequence of numbers, if the first is 3, the second is 6, and the third is 9… What is the fifth?
          </p>
          <input
            type="text"
            placeholder="Answer"
            disabled
            value="15"
            className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded text-xs font-bold mb-4 text-neutral-800 font-mono"
          />
          <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-neutral-600">
            <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
              <div className="text-neutral-500 uppercase tracking-widest text-[8px] font-bold">LATENCY</div>
              <div className="font-extrabold text-neutral-900 mt-0.5 text-xs">24ms</div>
            </div>
            <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
              <div className="text-neutral-500 uppercase tracking-widest text-[8px] font-bold">ENTROPY</div>
              <div className="font-extrabold text-neutral-900 mt-0.5 text-xs">0.842</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-neutral-100 bg-neutral-50/50 relative z-10">
        <div className="max-w-[1000px] mx-auto space-y-24">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-neutral-200/80 rounded-3xl p-8 lg:p-12 shadow-sm">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                The AI Spam Crisis
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight" style={{ letterSpacing: '-0.8px' }}>
                Hiring pipelines are being flooded by AI-generated submissions.
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Generative models can auto-tailor thousands of resumes to match your job descriptions perfectly, bypassing legacy keyword scanners. This creates massive administrative overhead for screening teams.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-neutral-900 text-white rounded-2xl p-6 text-center border border-neutral-800 relative overflow-hidden h-[180px]">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_70%)] pointer-events-none" />
              <span className="text-6xl font-black text-red-500 tracking-tighter relative z-10 leading-none">74%</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mt-2 relative z-10 font-bold">OF JOB APPLICATIONS</span>
              <p className="text-[11px] text-neutral-300 mt-2 font-medium max-w-[200px] relative z-10 leading-relaxed">
                are now synthesized or heavily augmented by AI agents.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-mono font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                A New Paradigm
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight text-neutral-900 mt-4" style={{ letterSpacing: '-0.8px' }}>
                Picket vs. Traditional Screening
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-medium">
                Why biometric verification and telemetry sandboxing outperform legacy keyword parsers and heavy take-home exams.
              </p>
            </div>

            <div className="border border-neutral-200/85 rounded-2xl bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 font-mono text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="p-4 w-[28%]">Screening Aspect</th>
                      <th className="p-4 w-[36%] border-l border-neutral-100">Legacy Methods (ATS / Take-homes)</th>
                      <th className="p-4 w-[36%] border-l border-neutral-150 bg-cyan-50/20 text-cyan-950">Picket Telemetry Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium text-neutral-600">
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">Application Filter</td>
                      <td className="p-4 border-l border-neutral-100">Static keyword matching (leads to keyword stuffing and candidate gaming).</td>
                      <td className="p-4 border-l border-neutral-150 bg-cyan-50/10 text-neutral-800">
                        Smart AI detection that flags auto-generated applications.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">Candidate Drop-off</td>
                      <td className="p-4 border-l border-neutral-100">High drop-offs due to demanding 3-to-4 hour assessment tests.</td>
                      <td className="p-4 border-l border-neutral-150 bg-cyan-50/10 text-neutral-800">
                        Zero friction for clear applicants; 60-second telemetry checks only for uncertain profiles.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">Cheating Detection</td>
                      <td className="p-4 border-l border-neutral-100">Intrusive screen recordings and tab-locking that frustrate candidates.</td>
                      <td className="p-4 border-l border-neutral-150 bg-cyan-50/10 text-neutral-800">
                        Analyzes typing patterns to instantly catch copy-pasting and bots.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">Platform Cost</td>
                      <td className="p-4 border-l border-neutral-100">High markups on API execution and fixed per-candidate pricing tiers.</td>
                      <td className="p-4 border-l border-neutral-150 bg-cyan-50/10 text-neutral-800">
                        Zero cost for API usage - we route to free, high-performance models by default.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-24 px-6 border-t border-neutral-100 bg-white relative z-10">
        <div className="max-w-[800px] mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
              Technical Details
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight text-neutral-900 mt-3" style={{ letterSpacing: '-0.8px' }}>
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Does Picket record what candidates type?",
                a: "No. Picket never captures or transmits the actual characters entered by candidates. We only measure how fast they type and if they copy-paste. Your candidates' sensitive answers remain 100% private."
              },
              {
                q: "Do I need to pay for AI API usage?",
                a: "No! Picket uses OpenRouter's free tier endpoints (like Llama 3.3 Instruct) by default. The backend is configured centrally, so individual recruiters don't have to worry about supplying API keys or managing inference costs."
              },
              {
                q: "How does the typing check detect bots and cheating?",
                a: "Bots typically paste text instantly or type at mathematically perfect speeds. Real humans naturally change speeds, pause to think, and use backspace. Picket checks these typing habits to accurately spot the fakes."
              },
              {
                q: "What integrations does Picket support?",
                a: "Picket supports standard webhooks and API integrations that can link to modern applicant tracking systems (ATS) like Greenhouse, Lever, and Ashby, triggering screening tasks automatically when a resume is uploaded."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-200 bg-neutral-50/20 hover:bg-neutral-50/50"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-5 text-left text-xs font-bold text-neutral-900 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-[9px] transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  <div
                    className="transition-all duration-355 ease-in-out overflow-hidden"
                    style={{
                      maxHeight: isOpen ? '150px' : '0px',
                      opacity: isOpen ? 1 : 0
                    }}
                  >
                    <p className="px-5 pb-5 text-xs text-neutral-600 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 text-center relative border-t border-neutral-200 bg-white/50 backdrop-blur-md z-10" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(38,198,218,0.06) 0%, transparent 60%)' }}>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 leading-none mb-6">
          Stop screening noise.<br/>Start finding signal.
        </h2>
        <p className="text-sm text-neutral-600 max-w-[420px] mx-auto mb-10 leading-relaxed">
          Screen your first pipeline. Detect synthetic actors and auto-generated applications in under 60 seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-sm mx-auto mb-16">
          <button onClick={onStartHiring} className="w-full sm:w-auto bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md">
            Start Hiring Free
          </button>
          <button onClick={() => onDocs('pow')} className="w-full sm:w-auto bg-white text-neutral-800 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900 px-6 py-3 rounded-lg text-sm font-semibold shadow-sm transition-all hover:bg-neutral-50 cursor-pointer">
            Proof of Work Specs
          </button>

        </div>

        <div className="pk-spin-logo mx-auto w-14 h-14 flex items-center justify-center bg-white rounded-full border border-neutral-200 shadow-sm">
          <svg width="22" height="26" viewBox="0 0 44 54" fill="none">
            <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#nav-pk-g-back)" transform="rotate(14 12.5 26)" />
            <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#nav-pk-g-front)" transform="rotate(-6 27.5 22)" />
          </svg>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-200 bg-white relative z-10 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 text-left">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="18" height="22" viewBox="0 0 44 54" fill="none">
                <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#nav-pk-g-back)" transform="rotate(14 12.5 26)" />
                <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#nav-pk-g-front)" transform="rotate(-6 27.5 22)" />
              </svg>
              <span className="font-bold text-base tracking-tight text-neutral-900">picket</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-[200px]">
              AI-powered candidate screening pipelines and biometric verification challenges.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
              <li onClick={() => onDocs('workspaces')} className="hover:text-neutral-900 cursor-pointer transition-colors">Projects</li>
              <li onClick={() => onDocs('screening')} className="hover:text-neutral-900 cursor-pointer transition-colors">Candidates</li>
              <li onClick={() => onDocs('statuses')} className="hover:text-neutral-900 cursor-pointer transition-colors">Analytics</li>
              <li onClick={() => onDocs('pow')} className="hover:text-neutral-900 cursor-pointer transition-colors">Proof of Work</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
              <li onClick={() => onDocs('welcome')} className="hover:text-neutral-900 cursor-pointer transition-colors">Docs</li>
              <li onClick={onHowItWorks} className="hover:text-neutral-900 cursor-pointer transition-colors">Agent Queue</li>
              <li onClick={() => onDocs('screening')} className="hover:text-neutral-900 cursor-pointer transition-colors">WebSockets</li>
              <li>
                <a
                  href="https://github.com/guesswhozayn/picket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
              <li onClick={() => onLegal('privacy')} className="hover:text-neutral-900 cursor-pointer transition-colors">Privacy</li>
              <li onClick={() => onLegal('terms')} className="hover:text-neutral-900 cursor-pointer transition-colors">Terms</li>
              <li onClick={() => onLegal('security')} className="hover:text-neutral-900 cursor-pointer transition-colors">Security</li>
            </ul>
          </div>

        </div>
        <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
          <span>© 2026 Picket Inc. All rights reserved.</span>
          <a
            href="https://bullmq.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-neutral-800 cursor-pointer transition-colors"
          >
            VERIFICATION SYSTEM POWERED BY BULLMQ <ExternalLink size={10} />
          </a>

        </div>
      </footer>
    </div>
  );
}
