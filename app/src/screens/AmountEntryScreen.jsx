import { useState, useCallback } from 'react';
import { formatIndianCurrency } from '../data';
import { IconArrowLeft, IconBackspace } from '../Icons';

export default function AmountEntryScreen({ contact, onBack, onPay }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pressedKey, setPressedKey] = useState(null);

  const quickAmounts = [100, 500, 1000, 2000];

  const handleKeyPress = useCallback((key) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);

    if (key === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.') && amount.length > 0) {
        setAmount(prev => prev + '.');
      }
    } else {
      // Limit to 7 digits before decimal, 2 after
      const parts = amount.split('.');
      if (parts.length === 2 && parts[1].length >= 2) return;
      if (parts.length === 1 && parts[0].length >= 7) return;
      if (amount === '0' && key !== '.') {
        setAmount(key);
      } else {
        setAmount(prev => prev + key);
      }
    }
  }, [amount]);

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handlePay = () => {
    const amountValue = parseFloat(amount);
    if (amountValue > 0) {
      onPay(contact, amountValue * 100, note);
    }
  };

  const amountDisplay = amount || '0';
  const amountValue = parseFloat(amount) || 0;
  const isValidAmount = amountValue > 0 && amountValue <= 100000;

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <div className="flex flex-col h-full screen-enter">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center btn-press border border-border">
          <IconArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: contact.color + '22', color: contact.color }}
          >
            {contact.avatar}
          </div>
          <div>
            <p className="text-sm font-bold">{contact.name}</p>
            <p className="text-[11px] text-text-muted font-mono">{contact.upiId}</p>
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-4">
        <p className="text-xs text-text-muted mb-3 font-semibold uppercase tracking-wider">Enter Amount</p>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="rupee-font text-3xl text-text-muted font-bold">₹</span>
          <span className={`rupee-font text-5xl font-bold transition-all duration-150 ${amountValue > 0 ? 'text-white' : 'text-text-muted'}`}>
            {amountDisplay}
          </span>
        </div>

        {/* Quick Amounts */}
        <div className="flex gap-2 mb-4">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              onClick={() => handleQuickAmount(qa)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 btn-press ${
                amount === qa.toString()
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-bg-card border border-border text-text-secondary hover:border-primary/30'
              }`}
            >
              ₹{qa.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {/* Note Field */}
        <div className="w-full mb-2">
          <input
            type="text"
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-bg-card/50 border border-border rounded-xl py-2.5 px-4 text-xs text-white placeholder:text-text-muted focus:border-primary/50 transition-all text-center"
            maxLength={50}
          />
        </div>
      </div>

      {/* Numpad */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {numpadKeys.flat().map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className={`h-14 rounded-xl flex items-center justify-center transition-all duration-100 ${
                pressedKey === key ? 'animate-numpad-press bg-bg-card-light' : ''
              } ${
                key === 'backspace'
                  ? 'bg-bg-card border border-border text-text-secondary active:bg-danger/20'
                  : 'bg-bg-card border border-border text-white text-xl font-semibold active:bg-primary/20'
              } btn-press`}
            >
              {key === 'backspace' ? <IconBackspace size={22} /> : key}
            </button>
          ))}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={!isValidAmount}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 btn-press ${
            isValidAmount
              ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-xl shadow-primary/30 hover:shadow-primary/50'
              : 'bg-bg-card text-text-muted border border-border cursor-not-allowed'
          }`}
        >
          {isValidAmount ? `Pay ${formatIndianCurrency(amountValue * 100)}` : 'Enter Amount'}
        </button>
      </div>
    </div>
  );
}
