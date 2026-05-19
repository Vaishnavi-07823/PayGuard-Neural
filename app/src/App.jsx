import { useState, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import SendMoneyScreen from './screens/SendMoneyScreen';
import AmountEntryScreen from './screens/AmountEntryScreen';
import ScanPayScreen from './screens/ScanPayScreen';
import SuccessScreen from './screens/SuccessScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import { IconHome, IconScan, IconHistory, IconProfile } from './Icons';

// Screen identifiers
const SCREENS = {
  HOME: 'home',
  SEND: 'send',
  AMOUNT: 'amount',
  SCAN: 'scan',
  SUCCESS: 'success',
  HISTORY: 'history',
  PROFILE: 'profile',
};

// Bottom nav tabs
const TABS = {
  HOME: 'home',
  SCAN: 'scan',
  HISTORY: 'history',
  PROFILE: 'profile',
};

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: TABS.HOME, label: 'Home', Icon: IconHome },
    { id: TABS.SCAN, label: 'Scan', Icon: IconScan },
    { id: TABS.HISTORY, label: 'History', Icon: IconHistory },
    { id: TABS.PROFILE, label: 'Profile', Icon: IconProfile },
  ];

  return (
    <div className="glass-heavy border-t border-border">
      <div className="flex items-center justify-around py-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const isScan = id === TABS.SCAN;

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 btn-press ${
                isActive ? '' : 'opacity-50 hover:opacity-80'
              }`}
            >
              {isScan ? (
                <div className={`w-12 h-12 -mt-6 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-primary to-accent shadow-primary/40 scale-110'
                    : 'bg-gradient-to-br from-primary to-primary-light shadow-primary/20'
                }`}>
                  <Icon size={22} className="text-white" />
                </div>
              ) : (
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary/15' : ''}`}>
                  <Icon size={20} className={isActive ? 'text-primary-light' : 'text-text-muted'} />
                </div>
              )}
              <span className={`text-[10px] font-bold transition-colors ${
                isActive ? (isScan ? 'text-accent' : 'text-primary-light') : 'text-text-muted'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-1"></div>
    </div>
  );
}

function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex items-center justify-between px-5 py-1.5 text-[11px] font-semibold text-text-secondary">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="1" />
          <rect x="4" y="5" width="3" height="7" rx="0.5" opacity="1" />
          <rect x="8" y="2" width="3" height="10" rx="0.5" opacity="1" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
        </svg>
        {/* WiFi */}
        <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
          <path d="M7 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" transform="translate(0,-2)" />
          <path d="M3.5 8.5C4.5 7 5.7 6.5 7 6.5s2.5.5 3.5 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 5.5C2.5 3 4.5 2 7 2s4.5 1 6 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-3 rounded-sm border border-current p-0.5">
            <div className="w-3/4 h-full bg-success rounded-[1px]"></div>
          </div>
          <div className="w-0.5 h-1.5 bg-current rounded-r-sm opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [selectedContact, setSelectedContact] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [screenDirection, setScreenDirection] = useState('forward');

  // Navigation history for back button
  const [history, setHistory] = useState([SCREENS.HOME]);

  const navigate = useCallback((screen, direction = 'forward') => {
    setScreenDirection(direction);
    setCurrentScreen(screen);
    if (direction === 'forward') {
      setHistory(prev => [...prev, screen]);
    }
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, -1);
      const previousScreen = newHistory[newHistory.length - 1] || SCREENS.HOME;
      setScreenDirection('back');
      setCurrentScreen(previousScreen);

      // Sync tab
      if ([SCREENS.HOME, SCREENS.SCAN, SCREENS.HISTORY, SCREENS.PROFILE].includes(previousScreen)) {
        setActiveTab(previousScreen);
      }

      return newHistory;
    });
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    const screenMap = {
      [TABS.HOME]: SCREENS.HOME,
      [TABS.SCAN]: SCREENS.SCAN,
      [TABS.HISTORY]: SCREENS.HISTORY,
      [TABS.PROFILE]: SCREENS.PROFILE,
    };
    navigate(screenMap[tab]);
    setHistory([screenMap[tab]]);
  }, [navigate]);

  const handleNavigate = useCallback((screen) => {
    if (screen === 'send') {
      navigate(SCREENS.SEND);
    } else if (screen === 'scan') {
      setActiveTab(TABS.SCAN);
      navigate(SCREENS.SCAN);
    } else if (screen === 'history') {
      setActiveTab(TABS.HISTORY);
      navigate(SCREENS.HISTORY);
    }
  }, [navigate]);

  const handleSelectContact = useCallback((contact) => {
    setSelectedContact(contact);
    navigate(SCREENS.AMOUNT);
  }, [navigate]);

  const handlePay = useCallback((contact, amount, note) => {
    setPaymentData({ contact, amount, note });
    navigate(SCREENS.SUCCESS);
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    setActiveTab(TABS.HOME);
    setCurrentScreen(SCREENS.HOME);
    setHistory([SCREENS.HOME]);
    setSelectedContact(null);
    setPaymentData(null);
  }, []);

  // Determine if bottom nav should show
  const showBottomNav = [SCREENS.HOME, SCREENS.HISTORY, SCREENS.PROFILE].includes(currentScreen);

  const renderScreen = () => {
    const animClass = screenDirection === 'back' ? 'screen-enter-back' : 'screen-enter';

    switch (currentScreen) {
      case SCREENS.HOME:
        return (
          <div key="home" className={history.length > 1 ? animClass : 'animate-fade-in'}>
            <HomeScreen onNavigate={handleNavigate} onSelectContact={handleSelectContact} />
          </div>
        );
      case SCREENS.SEND:
        return (
          <div key="send" className={animClass}>
            <SendMoneyScreen onBack={goBack} onSelectContact={handleSelectContact} />
          </div>
        );
      case SCREENS.AMOUNT:
        return (
          <div key="amount" className={animClass}>
            <AmountEntryScreen contact={selectedContact} onBack={goBack} onPay={handlePay} />
          </div>
        );
      case SCREENS.SCAN:
        return (
          <div key="scan" className={history.length > 1 ? animClass : 'animate-fade-in'}>
            <ScanPayScreen onBack={goBack} onNavigate={handleNavigate} />
          </div>
        );
      case SCREENS.SUCCESS:
        return (
          <div key="success" className="animate-fade-in">
            <SuccessScreen
              contact={paymentData?.contact}
              amount={paymentData?.amount}
              note={paymentData?.note}
              onGoHome={handleGoHome}
            />
          </div>
        );
      case SCREENS.HISTORY:
        return (
          <div key="history" className={history.length > 1 ? animClass : 'animate-fade-in'}>
            <HistoryScreen />
          </div>
        );
      case SCREENS.PROFILE:
        return (
          <div key="profile" className={history.length > 1 ? animClass : 'animate-fade-in'}>
            <ProfileScreen />
          </div>
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} onSelectContact={handleSelectContact} />;
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#050510]">
      {/* Phone Frame */}
      <div
        className="relative w-[390px] h-[844px] max-h-screen bg-bg-deep rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/60 border border-white/[0.06] flex flex-col"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 80px -12px rgba(0,0,0,0.8), 0 0 60px rgba(95,37,159,0.08)',
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="flex justify-center pt-2 pb-0 relative z-50">
          <div className="w-28 h-[26px] bg-black rounded-full"></div>
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden relative">
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </div>
  );
}
