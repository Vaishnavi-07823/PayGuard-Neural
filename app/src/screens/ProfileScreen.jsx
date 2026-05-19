import { user, bankAccounts } from '../data';
import { IconChevronRight, IconNotification, IconPrivacy, IconSecurity, IconHelp, IconLogout } from '../Icons';

export default function ProfileScreen() {
  const settingsItems = [
    { icon: IconNotification, label: 'Notifications', subtitle: 'Push & SMS alerts', color: '#00baf2' },
    { icon: IconPrivacy, label: 'Privacy', subtitle: 'Data & permissions', color: '#9C27B0' },
    { icon: IconSecurity, label: 'Security', subtitle: 'PIN, biometric & limits', color: '#00c853' },
    { icon: IconHelp, label: 'Help & Support', subtitle: '24/7 customer care', color: '#FF9800' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-lg font-bold">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="px-5 mb-6">
          <div className="glass rounded-2xl p-5 flex items-center gap-4 animate-fade-in-scale">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/30">
              {user.avatar}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">{user.fullName}</p>
              <p className="text-xs font-mono text-accent mt-0.5">{user.upiId}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{user.phone}</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-bg-card-light flex items-center justify-center btn-press">
              <IconChevronRight size={16} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Linked Bank Accounts */}
        <div className="px-5 mb-6">
          <p className="text-sm font-bold text-text-secondary mb-3">Linked Bank Accounts</p>
          <div className="space-y-2 stagger-children">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-card/50 border border-border btn-press hover:bg-bg-card transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: bank.color + '20' }}
                >
                  {bank.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{bank.bankName}</p>
                    {bank.isPrimary && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/15 text-primary-light text-[9px] font-bold shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted font-mono mt-0.5">
                    A/C {bank.accountNo} • {bank.ifsc}
                  </p>
                </div>
                <IconChevronRight size={16} className="text-text-muted shrink-0" />
              </div>
            ))}

            {/* Add Bank Account */}
            <button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-border text-sm font-bold text-text-muted hover:text-accent hover:border-accent/30 transition-all btn-press">
              <span className="text-lg leading-none">+</span>
              Add Bank Account
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="px-5 mb-6">
          <p className="text-sm font-bold text-text-secondary mb-3">Settings</p>
          <div className="space-y-1 stagger-children">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-bg-card/50 transition-all btn-press"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-[10px] text-text-muted">{item.subtitle}</p>
                  </div>
                  <IconChevronRight size={16} className="text-text-muted shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 mb-8">
          <button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-danger/20 text-danger text-sm font-bold btn-press hover:bg-danger/5 transition-all">
            <IconLogout size={18} />
            Log Out
          </button>
        </div>

        {/* App Version */}
        <div className="text-center pb-6">
          <p className="text-[10px] text-text-muted">PayGuard Neural v2.0.0</p>
          <p className="text-[10px] text-text-muted">Made with 💜 in India</p>
        </div>
      </div>
    </div>
  );
}
