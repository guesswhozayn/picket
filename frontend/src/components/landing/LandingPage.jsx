import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowRight, Shield, Globe, Brain, UploadCloud, CheckCircle, 
  ChevronRight, Users, Play, Sparkles, Terminal, Activity, Zap, Check, ExternalLink
} from 'lucide-react';
import '../../landing.css';

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

export default function LandingPage({ onStartHiring, onLogin }) {
  const containerRef = useIntersectionObserver();
  const [scrollY, setScrollY] = useState(0);

  // Live typing sandbox state
  const [typedText, setTypedText] = useState('');
  const [telemetry, setTelemetry] = useState({
    keystrokes: 0,
    pasteCount: 0,
    latencyList: [],
    avgLatency: 0,
    status: 'idle', // 'idle' | 'typing' | 'pasted'
  });
  const lastKeyTimeRef = useRef(null);

  const handleSandboxChange = (e) => {
    const val = e.target.value;
    const isPaste = Math.abs(val.length - typedText.length) > 4 && val.length > 0;
    
    if (isPaste) {
      setTelemetry(prev => ({
        ...prev,
        pasteCount: prev.pasteCount + 1,
        status: 'pasted'
      }));
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
      {/* Global Background Grid Pattern & Radial Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0" style={{ backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(38,198,218,0.15) 0%, transparent 80%)' }} />

      {/* ── 1. Navigation ── */}
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
            {['How it works', 'AI Agents', 'Features', 'Metrics'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-neutral-600 hover:text-neutral-900 hover:bg-white text-[13px] font-medium px-4 py-1.5 rounded-lg transition-all duration-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
              >
                {item}
              </a>
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

      {/* ── 2. Hero Section ── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden z-10">
        
        <div className="max-w-[1200px] mx-auto relative z-10">
          {/* Badge */}
          <div 
            data-pk-animate 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 border border-cyan-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(38,198,218,0.2)]" 
            style={{ background: 'rgba(38, 198, 218, 0.05)', color: '#26C6DA', fontSize: '11px', fontWeight: 600, letterSpacing: '-0.1px' }}
          >
          </div>
          
          {/* Headline */}
          <h1 
            data-pk-animate 
            data-pk-delay="1" 
            className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[0.95]"
            style={{ letterSpacing: '-2.8px' }}
          >
            The <span className="gradient-text">Synthetic</span> <br/> Recruiter.
          </h1>
          
          {/* Subheading */}
          <p 
            data-pk-animate 
            data-pk-delay="2" 
            className="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed"
          >
            Stop wasting interview cycles on synthetic applicants. Deploy background verification agents to audit resume files, cross-verify skill claims, and run interactive keystroke integrity challenges.
          </p>
          
          {/* Action Row */}
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
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md text-neutral-800 hover:text-neutral-900 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border border-neutral-200 shadow-sm hover:border-neutral-300 hover:bg-white"
            >
              <Play size={14} className="fill-current" />
              Watch Demo
            </a>
          </div>
          
          {/* Social Proof Labels */}
          <p data-pk-animate data-pk-delay="4" className="mt-6 text-[12px] text-neutral-600 font-medium tracking-wide">
            Zero friction integrations · Setup in 2 mins · 50 Free credits
          </p>

          {/* Interactive Live Telemetry Sandbox */}
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
                Live Telemetry Sandbox
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
                <span className="text-neutral-400 uppercase tracking-widest text-[8px] font-bold">AVG INTERVAL</span>
                <span className="font-extrabold text-neutral-900 text-xs mt-0.5">{telemetry.avgLatency ? `${telemetry.avgLatency}ms` : '—'}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[9px] text-neutral-400 font-mono">TELEMETRY STATS</span>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> PASTE DETECTED (HIGH RISK)
                </span>
              )}
            </div>
          </div>

          {/* Interactive HTML/CSS Dashboard Mockup */}
          <div 
            data-pk-scale 
            data-pk-delay="5" 
            className="relative max-w-[960px] mx-auto mt-20"
          >
            {/* Inner rounded container with overflow hidden */}
            <div 
              className="rounded-2xl border border-neutral-200/80 bg-white/60 backdrop-blur-2xl" 
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 40px rgba(38,198,218,0.06)', overflow: 'hidden' }}
            >
              {/* Window bar */}
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

              {/* Mock Dashboard Layout */}
              <div className="flex h-[460px] text-left text-neutral-800">
                {/* Sidebar */}
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

                {/* Main candidate stream */}
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

                  {/* Feed rows */}
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

            {/* Embedded Floating Cards on the sides */}
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

      {/* ── 3. Trust Bar ── */}
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

      {/* ── 4. Pipeline Section ── */}
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

      {/* ── 5. AI Agents Section ── */}
      <section id="ai-agents" className="py-24 px-6 bg-white/40 backdrop-blur-md border-y border-neutral-200 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[var(--picket-blue)] uppercase tracking-wider">VERIFICATION MECHANISMS</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mt-3">Three agents. One verdict.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tag: 'AGENT 01', icon: Shield, title: 'Synthetic Detector', desc: 'Analyzes CV structures and layout metadata using Gemini to catch auto-generated templates and prompt injection attempts.', footer: 'Gemini 2.5 Flash API', color: '#db2777', bg: 'rgba(219, 39, 119, 0.1)' },
              { tag: 'AGENT 02', icon: Globe, title: 'OSINT Verifier', desc: 'Performs automated digital footprint verification by querying Tavily for candidate profiles and validating active repositories.', footer: 'Tavily + Gemini API', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
              { tag: 'AGENT 03', icon: Brain, title: 'Proof of Work', desc: 'Dispatches custom logic challenges generated via Groq (Llama 3.3) and verifies keystroke/paste telemetry to guarantee human origin.', footer: 'Groq / Gemini + Telemetry', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' }
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

      {/* ── 6. Demo section ── */}
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
                'Parallel background execution with BullMQ',
                'Live WebSockets status streaming',
                'Full audit logs and confidence index per candidate',
                'One-click biometric Proof of Work challenge dispatch'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-medium text-neutral-700">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={onStartHiring} 
              className="flex items-center gap-1 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold px-4 py-2.5 rounded-lg text-xs border border-neutral-200 shadow-sm transition-all"
            >
              Try Picket Sandbox <ChevronRight size={14} />
            </button>
          </div>

          <div data-pk-animate data-pk-delay="2" className="bg-white/40 backdrop-blur-md border border-neutral-200/60 p-5 rounded-2xl" style={{ boxShadow: 'var(--sh-card-lg)' }}>
            <div className="bg-white border border-neutral-100 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-50 mb-1">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Active Screening</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                  Queue worker #3
                </span>
              </div>
              {[
                { name: 'Nadia Petrova', status: 'High Signal', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', c: 'pk-row-1' },
                { name: 'Unknown Dev Profile', status: 'High Noise', bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', c: 'pk-row-2' },
                { name: 'Aris Thorne', status: 'Audit Req.', bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', c: 'pk-row-3' },
                { name: 'Marcus Vance', status: 'Verifying...', bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb', c: 'pk-row-4 pk-badge-pulse' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between p-3 border border-neutral-100 rounded-lg text-xs bg-white hover:bg-neutral-50 transition-all ${row.c}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600">{row.name[0]}</div>
                    <span className="font-semibold text-neutral-800">{row.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono" style={{ background: row.bg, color: row.text }}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Metrics Section ── */}
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

      {/* ── 8. PoW Section ── */}
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

      {/* ── 9. CTA Banner ── */}
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
          <a href="#pow" className="w-full sm:w-auto bg-white text-neutral-800 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900 px-6 py-3 rounded-lg text-sm font-semibold shadow-sm transition-all hover:bg-neutral-50">
            Proof of Work Specs
          </a>
        </div>
        
        <div className="pk-spin-logo mx-auto w-14 h-14 flex items-center justify-center bg-white rounded-full border border-neutral-200 shadow-sm">
          <svg width="22" height="26" viewBox="0 0 44 54" fill="none">
            <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#nav-pk-g-back)" transform="rotate(14 12.5 26)" />
            <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#nav-pk-g-front)" transform="rotate(-6 27.5 22)" />
          </svg>
        </div>
      </section>

      {/* ── 10. Footer ── */}
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
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Projects</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Candidates</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Analytics</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Proof of Work</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">API Docs</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Agent Queue</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">WebSockets</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">GitHub</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Terms</li>
              <li className="hover:text-neutral-900 cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
          <span>© 2026 Picket Inc. All rights reserved.</span>
          <span className="flex items-center gap-1 hover:text-neutral-800 cursor-pointer transition-colors">
            VERIFICATION SYSTEM POWERED BY BULLMQ <ExternalLink size={10} />
          </span>
        </div>
      </footer>
    </div>
  );
}
