import { useEffect, useState } from 'react';
import { formatIndianCurrency, formatTime, generateTxnId } from '../data';
import { IconShare } from '../Icons';

export default function SuccessScreen({ contact, amount, note, onGoHome }) {
  const [animate, setAnimate] = useState(false);
  const txnId = generateTxnId();
  const timestamp = new Date().toISOString();

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center px-5 animate-fade-in">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-success/20 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-accent/20 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-success/30 animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Success Animation */}
      <div className={`mb-8 ${animate ? 'animate-success-scale' : 'opacity-0'}`}>
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#00c853"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                strokeDasharray: 283,
                strokeDashoffset: animate ? 0 : 283,
                transition: 'stroke-dashoffset 0.8s ease-out 0.3s',
              }}
            />
            {/* Background glow circle */}
            <circle cx="50" cy="50" r="42" fill="rgba(0, 200, 83, 0.08)" />
            {/* Checkmark */}
            <polyline
              points="30,52 45,65 72,38"
              fill="none"
              stroke="#00c853"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: animate ? 0 : 80,
                transition: 'stroke-dashoffset 0.5s ease-out 0.8s',
              }}
            />
          </svg>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-success/5 blur-xl"></div>
        </div>
      </div>

      {/* Success Text */}
      <h2 className="text-2xl font-bold mb-2 text-success" style={{ animationDelay: '0.4s' }}>
        Payment Successful!
      </h2>

      {/* Amount */}
      <p className="rupee-font text-4xl font-bold mb-6" style={{ animationDelay: '0.5s' }}>
        {formatIndianCurrency(amount)}
      </p>

      {/* Transaction Details Card */}
      <div className="w-full glass rounded-2xl p-5 mb-8 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: contact.color + '22', color: contact.color }}
          >
            {contact.avatar}
          </div>
          <div>
            <p className="text-sm font-bold">Paid to {contact.name}</p>
            <p className="text-[11px] text-text-muted font-mono">{contact.upiId}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">Transaction ID</span>
            <span className="text-xs font-mono text-text-secondary">{txnId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">Date & Time</span>
            <span className="text-xs text-text-secondary">{formatTime(timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">UPI Ref</span>
            <span className="text-xs font-mono text-text-secondary">UPI/{txnId.slice(-8)}</span>
          </div>
          {note && (
            <div className="flex justify-between">
              <span className="text-xs text-text-muted">Note</span>
              <span className="text-xs text-text-secondary">{note}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-xs text-text-muted">Status</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex gap-3 animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
        <button
          className="flex-1 py-3.5 rounded-xl bg-bg-card border border-border text-sm font-bold text-text-secondary btn-press flex items-center justify-center gap-2 hover:border-primary/30 transition-all"
        >
          <IconShare size={16} />
          Share Receipt
        </button>
        <button
          onClick={onGoHome}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold btn-press shadow-lg shadow-primary/30"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
