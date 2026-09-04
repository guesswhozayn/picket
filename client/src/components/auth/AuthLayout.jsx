import React from 'react';
import { Briefcase } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">

      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, var(--badge-blue-bg) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] mb-4 shadow-[var(--sh-card)]">
            <Briefcase size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            {title}
          </h1>
          <p className="text-[var(--text-body)] text-sm">
            {subtitle}
          </p>
        </div>

        <div
          className="rounded-2xl p-8 border border-[var(--bg-hover)]"
          style={{
            background: 'var(--bg)',
            boxShadow: 'var(--sh-modal)',
          }}
        >
          {children}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          &copy; 2026 Picket HR. Secure AI-powered screening.
        </p>
      </div>
    </div>
  );
}
