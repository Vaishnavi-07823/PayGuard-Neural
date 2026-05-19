import { useState, useEffect } from 'react';
import { recentTransactions, formatIndianCurrency, getRelativeDate, formatTime, groupTransactionsByDate } from '../data';
import { IconArrowUp, IconArrowDown, IconFilter } from '../Icons';

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'sent', label: 'Sent' },
    { id: 'received', label: 'Received' },
    { id: 'pending', label: 'Pending' },
  ];

  const filteredTxns = recentTransactions.filter(txn => {
    if (activeFilter === 'sent') return txn.type === 'debit';
    if (activeFilter === 'received') return txn.type === 'credit';
    if (activeFilter === 'pending') return txn.status === 'pending';
    return true;
  });

  const grouped = groupTransactionsByDate(filteredTxns);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Transaction History</h1>
        <button className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center btn-press border border-border">
          <IconFilter size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 btn-press ${
                activeFilter === filter.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-bg-card border border-border text-text-muted hover:text-text-secondary'
              }`}
            >
              {filter.label}
              {filter.id === 'pending' && (
                <span className="ml-1 w-4 h-4 inline-flex items-center justify-center rounded-full bg-warning/20 text-warning text-[9px]">
                  1
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl"></div>
            ))}
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <p className="text-sm font-bold text-text-secondary">No transactions found</p>
            <p className="text-xs text-text-muted mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([dateLabel, txns]) => (
              <div key={dateLabel} className="animate-fade-in">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-1">{dateLabel}</p>
                <div className="space-y-2">
                  {txns.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-bg-card/50 border border-border hover:bg-bg-card transition-all duration-200 btn-press"
                    >
                      {/* Direction Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        txn.type === 'debit' ? 'bg-danger/10' : 'bg-success/10'
                      }`}>
                        {txn.type === 'debit' ? (
                          <IconArrowUp size={18} className="text-danger" />
                        ) : (
                          <IconArrowDown size={18} className="text-success" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{txn.name}</p>
                          {txn.status === 'pending' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-[9px] font-bold shrink-0">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">
                          {txn.upiRef.slice(0, 25)}... • {formatTime(txn.date)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className={`rupee-font text-sm font-bold ${
                          txn.type === 'credit' ? 'text-success' : 'text-danger'
                        }`}>
                          {txn.type === 'credit' ? '+' : '-'} {formatIndianCurrency(txn.amount)}
                        </p>
                        <p className="text-[9px] text-text-muted mt-0.5">
                          {txn.status === 'completed' ? '✓ Done' : '⏳ Processing'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-6"></div>
      </div>
    </div>
  );
}
