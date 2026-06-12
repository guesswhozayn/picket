import React from 'react';
import { 
  ArrowLeft, UploadCloud, Cpu, Mail, Zap, Shield, Info 
} from 'lucide-react';

export default function HowItWorksPage({ onBack }) {
  const steps = [
    {
      title: 'Resume Ingestion',
      icon: UploadCloud,
      color: '#0068d6',
      bg: '#ebf5ff',
      desc: 'Recruiters upload applicant resumes in PDF or DOCX format. Picket parses the text instantly to isolate details, claimed credentials, and skill sets.',
      detail: 'Includes advanced sanitization checks to find invisible prompt injection phrases trying to override evaluations.'
    },
    {
      title: 'Asynchronous Queueing',
      icon: Zap,
      color: '#a81d78',
      bg: '#fef0f9',
      desc: 'To prevent application lag, candidate text is queued via BullMQ powered by a Redis data layer. Background workers pick up tasks sequentially.',
      detail: 'Guarantees the dashboard remains responsive even during high-volume application spikes.'
    },
    {
      title: 'Parallel Agent Verification',
      icon: Cpu,
      color: '#1a7f4b',
      bg: '#f0faf5',
      desc: 'Three independent AI agents audit the candidate in parallel: analyzing writing structures, performing social footprint audits, and designing tests.',
      detail: 'The synthetic detector checks language entropy, while the social crawler checks Github/LinkedIn footprints.'
    },
    {
      title: 'Verification Verdicts',
      icon: Shield,
      color: '#d66800',
      bg: '#fff7eb',
      desc: 'Agents combine their scores to determine Bot Index values. High signal profiles are approved, while suspicious ones are flagged.',
      detail: 'Status indicators like High Signal, Audit Required, and High Noise let recruiters sort candidates instantly.'
    },
    {
      title: 'Interactive Proof of Work Check',
      icon: Mail,
      color: '#c53030',
      bg: '#fff5f4',
      desc: 'If a candidate requires auditing, Picket emails them a custom logic puzzle. Telemetry tracking evaluates their keystroke rhythm.',
      detail: 'Blocks auto-paste bots and scripted submissions. Real human developers pass easily in under two minutes.'
    }
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
                <linearGradient id="hiw-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
                <linearGradient id="hiw-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#26C6DA" />
                  <stop offset="100%" stopColor="#1565C0" />
                </linearGradient>
              </defs>
              <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#hiw-g-back)" transform="rotate(14 12.5 26)" />
              <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#hiw-g-front)" transform="rotate(-6 27.5 22)" />
            </svg>
            <span className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.6px' }}>picket</span>
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider text-[9px]">
              Workflow
            </span>
          </div>
        </div>
        <button onClick={onBack} className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
          Exit to Home
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[900px] mx-auto w-full px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">Operational Pipeline</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mt-2 mb-4 leading-none">
            How Picket Screens Candidates
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Our multi-layered background verification runs automatically. Here is a walkthrough of the candidate screening journey.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative border-l border-neutral-100 ml-4 md:ml-6 space-y-12 pb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative pl-8 md:pl-12">
                {/* Step indicator circle */}
                <div 
                  className="absolute -left-[18px] top-0.5 w-9 h-9 rounded-full border border-white flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: step.bg, color: step.color }}
                >
                  <Icon size={16} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: step.color }}>
                      Step 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900">{step.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">{step.desc}</p>
                  
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 max-w-2xl mt-3 flex gap-2">
                    <Info size={14} className="text-neutral-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-500 leading-relaxed">{step.detail}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA section */}
        <div className="mt-16 p-8 rounded-2xl border border-neutral-200 bg-neutral-50 text-center space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">Ready to start hiring?</h2>
          <p className="text-xs text-neutral-600 max-w-md mx-auto">
            Configure your first job opening, upload resume drafts, and watch the verification dashboard sort signals in real time.
          </p>
          <div className="pt-2">
            <button 
              onClick={onBack} 
              className="bg-neutral-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
