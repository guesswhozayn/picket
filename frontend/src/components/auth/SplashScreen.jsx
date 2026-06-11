import React from 'react';
import { Briefcase, Loader } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--text-primary)] text-[var(--bg)] flex items-center justify-center shadow-[var(--sh-card)] animate-pulse">
          <Briefcase size={32} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            picket
          </h2>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Loader size={14} className="animate-spin" />
            <span className="text-xs font-medium uppercase tracking-widest">Initialising session...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
