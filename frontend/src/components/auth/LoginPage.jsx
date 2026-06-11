import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { Loader, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your Picket dashboard"
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
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[13px] font-medium text-[var(--text-primary)]">
              Password
            </label>
          </div>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 justify-center mt-2"
        >
          {isSubmitting ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-[var(--text-body)] mt-2">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[var(--badge-blue-text)] font-medium hover:underline p-0 bg-transparent border-none cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
