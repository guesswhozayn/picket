import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Loader, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ onSwitch }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join the future of HR screening"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{ background: 'var(--badge-red-bg)', color: 'var(--badge-red-text)' }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">
            Full Name
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]"
            />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">
            Confirm Password
          </label>
          <div className="relative">
            <CheckCircle2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 justify-center mt-2"
        >
          {isSubmitting ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            'Get Started'
          )}
        </button>

        <p className="text-center text-sm text-[var(--text-body)] mt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[var(--badge-blue-text)] font-medium hover:underline p-0 bg-transparent border-none cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
