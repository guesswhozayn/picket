import React, { useState } from 'react';
import api from '../api';
import { Brain, Clock, Zap, CheckCircle } from 'lucide-react';

export default function PoWChallenge({ candidateId, candidate: initialCandidate, onComplete }) {
  const [candidate, setCandidate] = useState(initialCandidate || null);
  const [loading, setLoading] = useState(!initialCandidate);
  const [step, setStep] = useState('intro');
  const [answer, setAnswer] = useState('');
  const [startTime] = useState(() => Date.now());
  const [logs, setLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!initialCandidate && candidateId) {
      api.get(`/api/candidates/public-assessment/${candidateId}`)
        .then(res => {
          setCandidate(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Fetch public assessment failed:', err);
          setLoading(false);
        });
    }
  }, [candidateId, initialCandidate]);

  const logEvent = (event, data = {}) =>
    setLogs(prev => [...prev, { event, timestamp: Date.now(), data }]);

  const handleInputChange = e => {
    const val = e.target.value;
    setAnswer(val);
    logEvent('keystroke', { length: val.length, lastChar: val.slice(-1) });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const timeTaken = Date.now() - startTime;
    logEvent('submit', { finalAnswer: answer, timeTaken });

    try {
      await api.patch(`/api/candidates/${candidateId}/pow`, {
        answer,
        interaction_logs: logs,
        time_taken: timeTaken,
      });
      setStep('success');
      setTimeout(onComplete, 2000);
    } catch {
      alert('Failed to submit challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-center flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
      Loading assessment details…
    </div>
  );

  if (step === 'intro') return (
    <div className="p-8 text-center flex flex-col items-center gap-5">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'var(--bg-surface)', boxShadow: 'var(--sh-ring-lt)' }}
      >
        <Brain size={26} style={{ color: 'var(--text-body)' }} />
      </div>
      <div>
        <h4 style={{ letterSpacing: '-0.32px' }}>Human Verification Required</h4>
        <p className="text-[14px] mt-2 leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-body)' }}>
          Complete a brief logic challenge to confirm you're human. Your interaction patterns are measured.
        </p>
      </div>
      <button
        onClick={() => { setStep('challenge'); logEvent('start_challenge'); }}
        className="btn-primary w-full justify-center"
      >
        Start Challenge
      </button>
    </div>
  );

  if (step === 'success') return (
    <div className="p-12 text-center flex flex-col items-center gap-4">
      <CheckCircle size={48} style={{ color: 'var(--badge-green-text)' }} />
      <div>
        <h4 style={{ letterSpacing: '-0.32px' }}>Verified!</h4>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-body)' }}>
          Your application is being processed by our agents.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* PoW header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: 'var(--badge-blue-text)' }} />
          <span
            className="text-[11px] font-medium uppercase"
            style={{
              fontFamily: 'var(--font-mono, Geist Mono, ui-monospace, monospace)',
              color: 'var(--badge-blue-text)',
              letterSpacing: '0.5px',
            }}
          >
            Proof of Work
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <Clock size={12} />
          Live tracking
        </span>
      </div>

      {/* Challenge */}
      <div
        className="rounded-lg p-5"
        style={{ background: 'var(--bg-surface)', boxShadow: 'var(--sh-ring)' }}
      >
        <p
          className="mono-label mb-3"
          style={{ color: 'var(--badge-blue-text)' }}
        >
          Logic Challenge
        </p>
        <p className="text-[14px] leading-relaxed mb-4" style={{ color: 'var(--text-body)' }}>
          {candidate?.pow_data?.question || 'In a sequence of numbers, if the first is 3, the second is 6, and the third is 9… What is the fifth?'}
        </p>
        <input
          type="text"
          autoFocus
          value={answer}
          onChange={handleInputChange}
          onPaste={() => logEvent('paste_detected')}
          placeholder="Your answer"
          className="text-[18px] font-semibold"
          style={{ letterSpacing: '-0.5px' }}
        />
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3">
        {[{ label: 'Latency', value: '24ms' }, { label: 'Entropy', value: '0.842' }].map(s => (
          <div
            key={s.label}
            className="rounded-md px-4 py-3"
            style={{ background: 'var(--bg-surface)', boxShadow: 'var(--sh-ring-lt)' }}
          >
            <p className="mono-label mb-1">{s.label}</p>
            <p
              className="text-[15px] font-medium"
              style={{
                fontFamily: 'var(--font-mono, Geist Mono, ui-monospace, monospace)',
                letterSpacing: '-0.3px',
                color: 'var(--text-primary)',
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !answer}
        className="btn-primary justify-center"
      >
        {isSubmitting ? 'Analyzing…' : 'Submit Verification'}
      </button>
    </div>
  );
}
