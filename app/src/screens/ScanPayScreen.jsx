import { useState } from 'react';
import { IconArrowLeft, IconQrCode } from '../Icons';
import { user } from '../data';

export default function ScanPayScreen({ onBack, onNavigate }) {
  const [showMyQR, setShowMyQR] = useState(false);
  const [manualUpi, setManualUpi] = useState('');

  return (
    <div className="flex flex-col h-full screen-enter">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center btn-press border border-border">
          <IconArrowLeft size={18} className="text-text-secondary" />
        </button>
        <h1 className="text-lg font-bold">Scan & Pay</h1>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 overflow-y-auto">
        {!showMyQR ? (
          <>
            {/* Scanner Frame */}
            <div className="relative w-64 h-64 mt-6 mb-6 animate-fade-in-scale">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-accent rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-accent rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-accent rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-accent rounded-br-lg"></div>

              {/* Scanner area */}
              <div className="absolute inset-3 bg-bg-card/30 rounded-lg overflow-hidden border border-border">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                ></div>

                {/* Scan line */}
                <div
                  className="absolute left-0 right-0 h-0.5 animate-scan"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #00baf2, #00baf2, transparent)',
                    boxShadow: '0 0 15px rgba(0, 186, 242, 0.6), 0 0 30px rgba(0, 186, 242, 0.3)',
                  }}
                ></div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconQrCode size={48} className="text-white/10" />
                </div>
              </div>
            </div>

            <p className="text-sm text-text-secondary font-semibold mb-1">Point camera at QR code</p>
            <p className="text-xs text-text-muted mb-6">Align the QR code within the frame to scan</p>

            {/* My QR Code Button */}
            <button
              onClick={() => setShowMyQR(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-card border border-border text-sm font-bold text-accent btn-press hover:border-accent/30 transition-all mb-6"
            >
              <IconQrCode size={18} />
              My QR Code
            </button>

            {/* Manual UPI Entry */}
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-text-muted font-semibold">OR</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <input
                type="text"
                placeholder="Enter UPI ID (e.g. name@ybl)"
                value={manualUpi}
                onChange={(e) => setManualUpi(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-xl py-3 px-4 text-sm text-white placeholder:text-text-muted focus:border-accent/50 transition-all text-center font-mono"
              />
              {manualUpi && (
                <button
                  onClick={() => {}}
                  className="w-full mt-3 py-3 rounded-xl bg-accent text-white font-bold text-sm btn-press shadow-lg shadow-accent/20"
                >
                  Verify & Pay
                </button>
              )}
            </div>
          </>
        ) : (
          /* My QR Code View */
          <div className="flex flex-col items-center py-8 animate-fade-in-scale">
            <div className="glass rounded-2xl p-6 mb-6">
              {/* Simulated QR Code */}
              <div className="w-52 h-52 bg-white rounded-xl p-3 mb-4">
                <div className="w-full h-full relative">
                  {/* QR Code pattern simulation */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Top-left position marker */}
                    <rect x="10" y="10" width="50" height="50" fill="none" stroke="#1a1a2e" strokeWidth="6" />
                    <rect x="20" y="20" width="30" height="30" fill="#1a1a2e" />
                    {/* Top-right position marker */}
                    <rect x="140" y="10" width="50" height="50" fill="none" stroke="#1a1a2e" strokeWidth="6" />
                    <rect x="150" y="20" width="30" height="30" fill="#1a1a2e" />
                    {/* Bottom-left position marker */}
                    <rect x="10" y="140" width="50" height="50" fill="none" stroke="#1a1a2e" strokeWidth="6" />
                    <rect x="20" y="150" width="30" height="30" fill="#1a1a2e" />
                    {/* Data modules - scattered blocks */}
                    {[
                      [70, 15], [85, 15], [100, 15], [115, 15],
                      [70, 30], [100, 30], [120, 30],
                      [15, 70], [30, 70], [70, 70], [85, 70], [100, 70], [130, 70], [160, 70], [175, 70],
                      [15, 85], [45, 85], [70, 85], [115, 85], [145, 85], [175, 85],
                      [15, 100], [30, 100], [55, 100], [85, 100], [100, 100], [130, 100], [160, 100],
                      [15, 115], [70, 115], [100, 115], [115, 115], [145, 115], [175, 115],
                      [15, 130], [45, 130], [85, 130], [130, 130], [160, 130],
                      [70, 145], [85, 145], [100, 145], [115, 145], [145, 145], [175, 145],
                      [70, 160], [100, 160], [130, 160], [160, 160],
                      [70, 175], [85, 175], [115, 175], [145, 175], [175, 175],
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="12" height="12" fill="#1a1a2e" rx="1" />
                    ))}
                    {/* Center branding */}
                    <circle cx="100" cy="100" r="18" fill="#5f259f" />
                    <text x="100" y="105" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">P</text>
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <p className="text-base font-bold">{user.fullName}</p>
                <p className="text-xs font-mono text-accent mt-1">{user.upiId}</p>
              </div>
            </div>

            <button
              onClick={() => setShowMyQR(false)}
              className="px-6 py-3 rounded-xl bg-bg-card border border-border text-sm font-bold text-text-secondary btn-press"
            >
              Back to Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
