import React from 'react';
import {
  ArrowLeft, LayoutDashboard, Settings, Activity, Users, Download, Mail, Star
} from 'lucide-react';

export default function FeaturesPage({ onBack }) {
  const features = [
    {
      title: 'Interactive Project Workspaces',
      icon: LayoutDashboard,
      desc: 'Create separate spaces for different job openings. Customize parameters like job category, skills, location, and headcount to organize candidate feeds.'
    },
    {
      title: 'Real-Time Pipeline Updates',
      icon: Activity,
      desc: 'Watch candidate records update instantly. The pipeline dashboard updates confidence index metrics as background queue workers compile reports.'
    },
    {
      title: 'Custom API Settings (BYOK)',
      icon: Settings,
      desc: 'Configure Google Gemini, Tavily Search, and Groq API keys to run verification agents on your personal resource limits.'
    },
    {
      title: 'In-Depth Candidate Drawer Audits',
      icon: Users,
      desc: 'Click any candidate record to slide open a detailed drawer. Review claims verified by the social crawler, reading source links and citation records.'
    },
    {
      title: 'One-Click Candidate Exporting',
      icon: Download,
      desc: 'Export workspace candidate records to CSV format. Keep external tracking files or applicant logs synchronized.'
    },
    {
      title: 'Automatic Challenge Emails',
      icon: Mail,
      desc: 'When a resume flags minor inconsistencies, Picket dispatches a skill challenge via email, verifying applicants while recruiters sleep.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>

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
                <linearGradient id="features-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1565C0" />
                  <stop offset="100%" stopColor="#1E88E5" />
                </linearGradient>
                <linearGradient id="features-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#26C6DA" />
                  <stop offset="100%" stopColor="#1565C0" />
                </linearGradient>
              </defs>
              <rect x="4" y="6" width="17" height="40" rx="8.5" fill="url(#features-g-back)" transform="rotate(14 12.5 26)" />
              <rect x="20" y="3" width="15" height="38" rx="7.5" fill="url(#features-g-front)" transform="rotate(-6 27.5 22)" />
            </svg>
            <span className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.6px' }}>picket</span>
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider text-[9px]">
              Features
            </span>
          </div>
        </div>
        <button onClick={onBack} className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
          Exit to Home
        </button>
      </header>

      <main className="flex-1 max-w-[1000px] mx-auto w-full px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[#0068d6] uppercase tracking-wider">Product Features</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mt-2 mb-4 leading-none">
            Everything You Need to Screen Quality
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Picket equips recruiting teams with powerful tools to verify human origin, filter out templates, and track talent signals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 flex gap-4 hover:shadow-md transition-all duration-200"
              >
                <span className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-150 flex items-center justify-center shrink-0 text-blue-600">
                  <Icon size={20} />
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-900">{feature.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-neutral-50 p-6 md:p-8 rounded-2xl border border-neutral-250 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Star size={24} className="fill-current" />
          </div>
          <div className="space-y-1 flex-1 text-center md:text-left">
            <h3 className="text-sm font-bold text-neutral-900">Need Enterprise Integrations?</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Picket can integrate with existing applicant tracking platforms (ATS) such as Greenhouse, Lever, and Workday to trigger background verifications on candidate stage transitions.
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            Start Screening
          </button>
        </div>
      </main>
    </div>
  );
}
