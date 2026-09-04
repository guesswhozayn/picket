import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

export default function AuthPages({ initialView = 'login', onBack }) {
  const [view, setView] = useState(initialView);

  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-4 left-4 z-50 text-xs font-mono font-medium hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back
        </button>
      )}
      {view === 'login' ? (
        <LoginPage onSwitch={() => setView('register')} />
      ) : (
        <RegisterPage onSwitch={() => setView('login')} />
      )}
    </>
  );
}
