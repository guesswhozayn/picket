import React from 'react';
import { Loader } from 'lucide-react';
import PicketLogo from '../common/PicketLogo';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-6">
        <PicketLogo size={48} variant="badge" className="animate-pulse" />
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
