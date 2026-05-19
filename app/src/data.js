// ===== MOCK DATA FOR PAYGUARD NEURAL UPI APP =====

export const user = {
  name: 'Rahul',
  fullName: 'Rahul Sharma',
  upiId: 'rahul@ybl',
  phone: '+91 98765 43210',
  avatar: 'RS',
  balance: 1245000, // in paise (₹12,450.00)
};

export const contacts = [
  { id: 1, name: 'Priya Patel', upiId: 'priya.patel@okaxis', phone: '9876543201', avatar: 'PP', color: '#E91E63' },
  { id: 2, name: 'Amit Kumar', upiId: 'amit.kumar@ybl', phone: '9876543202', avatar: 'AK', color: '#2196F3' },
  { id: 3, name: 'Sneha Reddy', upiId: 'sneha.r@paytm', phone: '9876543203', avatar: 'SR', color: '#4CAF50' },
  { id: 4, name: 'Vikram Singh', upiId: 'vikram.s@okicici', phone: '9876543204', avatar: 'VS', color: '#FF9800' },
  { id: 5, name: 'Deepika Nair', upiId: 'deepika.n@ybl', phone: '9876543205', avatar: 'DN', color: '#9C27B0' },
  { id: 6, name: 'Arjun Mehta', upiId: 'arjun.m@okaxis', phone: '9876543206', avatar: 'AM', color: '#00BCD4' },
  { id: 7, name: 'Kavita Joshi', upiId: 'kavita.j@paytm', phone: '9876543207', avatar: 'KJ', color: '#FF5722' },
  { id: 8, name: 'Rohan Gupta', upiId: 'rohan.g@ybl', phone: '9876543208', avatar: 'RG', color: '#3F51B5' },
  { id: 9, name: 'Ananya Bose', upiId: 'ananya.b@okaxis', phone: '9876543209', avatar: 'AB', color: '#8BC34A' },
  { id: 10, name: 'Manish Tiwari', upiId: 'manish.t@oksbi', phone: '9876543210', avatar: 'MT', color: '#795548' },
];

export const recentTransactions = [
  {
    id: 'TXN20260519001',
    name: 'Priya Patel',
    avatar: 'PP',
    color: '#E91E63',
    amount: 250000,
    type: 'debit',
    upiRef: 'UPI/260519001/priya.patel@okaxis',
    date: '2026-05-19T09:30:00',
    status: 'completed',
    note: 'Lunch bill split',
  },
  {
    id: 'TXN20260519002',
    name: 'Amit Kumar',
    avatar: 'AK',
    color: '#2196F3',
    amount: 500000,
    type: 'credit',
    upiRef: 'UPI/260519002/amit.kumar@ybl',
    date: '2026-05-19T08:15:00',
    status: 'completed',
    note: 'Project payment',
  },
  {
    id: 'TXN20260518003',
    name: 'Sneha Reddy',
    avatar: 'SR',
    color: '#4CAF50',
    amount: 150000,
    type: 'debit',
    upiRef: 'UPI/260518003/sneha.r@paytm',
    date: '2026-05-18T19:45:00',
    status: 'completed',
    note: 'Movie tickets',
  },
  {
    id: 'TXN20260518004',
    name: 'Vikram Singh',
    avatar: 'VS',
    color: '#FF9800',
    amount: 100000,
    type: 'credit',
    upiRef: 'UPI/260518004/vikram.s@okicici',
    date: '2026-05-18T14:20:00',
    status: 'completed',
    note: 'Cab fare return',
  },
  {
    id: 'TXN20260517005',
    name: 'Deepika Nair',
    avatar: 'DN',
    color: '#9C27B0',
    amount: 350000,
    type: 'debit',
    upiRef: 'UPI/260517005/deepika.n@ybl',
    date: '2026-05-17T11:00:00',
    status: 'completed',
    note: 'Birthday gift',
  },
  {
    id: 'TXN20260517006',
    name: 'Arjun Mehta',
    avatar: 'AM',
    color: '#00BCD4',
    amount: 75000,
    type: 'debit',
    upiRef: 'UPI/260517006/arjun.m@okaxis',
    date: '2026-05-17T09:30:00',
    status: 'completed',
    note: 'Coffee',
  },
  {
    id: 'TXN20260516007',
    name: 'Kavita Joshi',
    avatar: 'KJ',
    color: '#FF5722',
    amount: 200000,
    type: 'credit',
    upiRef: 'UPI/260516007/kavita.j@paytm',
    date: '2026-05-16T16:00:00',
    status: 'completed',
    note: 'Rent share',
  },
  {
    id: 'TXN20260516008',
    name: 'Rohan Gupta',
    avatar: 'RG',
    color: '#3F51B5',
    amount: 120000,
    type: 'debit',
    upiRef: 'UPI/260516008/rohan.g@ybl',
    date: '2026-05-16T12:30:00',
    status: 'pending',
    note: 'Book purchase',
  },
  {
    id: 'TXN20260512009',
    name: 'Ananya Bose',
    avatar: 'AB',
    color: '#8BC34A',
    amount: 450000,
    type: 'credit',
    upiRef: 'UPI/260512009/ananya.b@okaxis',
    date: '2026-05-12T10:00:00',
    status: 'completed',
    note: 'Freelance work',
  },
  {
    id: 'TXN20260512010',
    name: 'Manish Tiwari',
    avatar: 'MT',
    color: '#795548',
    amount: 180000,
    type: 'debit',
    upiRef: 'UPI/260512010/manish.t@oksbi',
    date: '2026-05-12T08:45:00',
    status: 'completed',
    note: 'Groceries',
  },
];

export const bankAccounts = [
  {
    id: 1,
    bankName: 'State Bank of India',
    shortName: 'SBI',
    accountNo: '****6789',
    ifsc: 'SBIN0001234',
    isPrimary: true,
    color: '#1a5276',
    logo: '🏛️',
  },
  {
    id: 2,
    bankName: 'HDFC Bank',
    shortName: 'HDFC',
    accountNo: '****4321',
    ifsc: 'HDFC0005678',
    isPrimary: false,
    color: '#004B87',
    logo: '🏦',
  },
  {
    id: 3,
    bankName: 'ICICI Bank',
    shortName: 'ICICI',
    accountNo: '****8765',
    ifsc: 'ICIC0009012',
    isPrimary: false,
    color: '#B02A30',
    logo: '🏧',
  },
];

export const quickActions = [
  { id: 'send', label: 'Send Money', icon: 'send', gradient: 'from-[#5f259f] to-[#7b3fc7]' },
  { id: 'request', label: 'Request Money', icon: 'request', gradient: 'from-[#00baf2] to-[#0090c7]' },
  { id: 'contacts', label: 'Pay Contacts', icon: 'contacts', gradient: 'from-[#00c853] to-[#009624]' },
  { id: 'recharge', label: 'Mobile Recharge', icon: 'recharge', gradient: 'from-[#ff9800] to-[#e65100]' },
  { id: 'electricity', label: 'Electricity', icon: 'electricity', gradient: 'from-[#ffab00] to-[#ff8f00]' },
  { id: 'scan', label: 'Scan & Pay', icon: 'scan', gradient: 'from-[#e91e63] to-[#c2185b]' },
];

// ===== UTILITY FUNCTIONS =====

export function formatIndianCurrency(paise) {
  const rupees = paise / 100;
  const parts = rupees.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  
  // Indian number system formatting
  const lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== '') {
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    intPart = lastThree;
  }
  
  return `₹${intPart}.${decPart}`;
}

export function formatShortCurrency(paise) {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function generateTxnId() {
  return 'TXN' + Date.now().toString().slice(-10);
}

export function groupTransactionsByDate(transactions) {
  const groups = {};
  transactions.forEach(txn => {
    const key = getRelativeDate(txn.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  });
  return groups;
}
