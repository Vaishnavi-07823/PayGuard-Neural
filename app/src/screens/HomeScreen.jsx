import { useState, useEffect } from 'react';
import { user, quickActions, recentTransactions, formatIndianCurrency, getGreeting, formatTime } from '../data';
import { IconBell, IconEye, IconEyeOff, IconCopy, QuickActionIcon } from '../Icons';

export default function HomeScreen({ onNavigate, onSelectContact }) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(user.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'send' || actionId === 'contacts') {
      onNavigate('send');
    } else if (actionId === 'scan') {
      onNavigate('scan');
    }
  };

  const recent5 = recentTransactions.slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Top Bar */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold">
              {user.avatar}
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">{getGreeting()},</p>
              <p className="text-base font-bold">{user.name} 👋</p>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-bg-card flex items-center justify-center btn-press border border-border">
            <IconBell size={20} className="text-text-secondary" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger"></span>
          </button>
        </div>

        {/* UPI ID */}
        <div className="px-5 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">UPI ID:</span>
            <span className="text-xs font-mono text-accent font-semibold">{user.upiId}</span>
            <button onClick={handleCopyUpi} className="btn-press p-1 rounded-md hover:bg-bg-card transition-colors">
              {copied ? (
                <span className="text-[10px] text-success font-bold">Copied!</span>
              ) : (
                <IconCopy size={14} className="text-text-muted" />
              )}
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="px-5 mb-6">
          <div className="glass rounded-2xl p-5 relative overflow-hidden animate-fade-in-scale" style={{ animationDelay: '0.15s' }}>
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-accent/10 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Available Balance</p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="btn-press p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {showBalance ? <IconEye size={18} className="text-text-secondary" /> : <IconEyeOff size={18} className="text-text-secondary" />}
                </button>
              </div>
              <p className="rupee-font text-3xl font-bold tracking-tight">
                {showBalance ? formatIndianCurrency(user.balance) : '₹ ••••••'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
                  <span className="w-1 h-1 rounded-full bg-success"></span>
                  UPI Active
                </span>
                <span className="text-[10px] text-text-muted">• Linked to SBI ****6789</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mb-6">
          <p className="text-sm font-bold text-text-secondary mb-3">Quick Actions</p>
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 stagger-children">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="ripple-container btn-press flex flex-col items-center gap-2 p-3.5 rounded-xl bg-bg-card border border-border hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <QuickActionIcon icon={action.icon} size={18} className="text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-text-secondary group-hover:text-white transition-colors leading-tight text-center">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-text-secondary">Recent Transactions</p>
            <button onClick={() => onNavigate('history')} className="text-xs font-bold text-accent btn-press">View All</button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {recent5.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-bg-card/50 border border-border hover:bg-bg-card transition-all duration-200 btn-press"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: txn.color + '22', color: txn.color }}
                  >
                    {txn.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{txn.name}</p>
                    <p className="text-[11px] text-text-muted truncate">{txn.note} • {formatTime(txn.date)}</p>
                  </div>
                  <p className={`rupee-font text-sm font-bold ${txn.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                    {txn.type === 'credit' ? '+' : '-'} {formatIndianCurrency(txn.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}
