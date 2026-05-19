import { useState } from 'react';
import { contacts } from '../data';
import { IconArrowLeft, IconSearch } from '../Icons';

export default function SendMoneyScreen({ onBack, onSelectContact }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.upiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const recentContacts = contacts.slice(0, 5);

  const tabs = [
    { id: 'contacts', label: 'Contacts' },
    { id: 'recents', label: 'Recents' },
    { id: 'bank', label: 'Bank Transfer' },
  ];

  const displayContacts = activeTab === 'recents' ? recentContacts : filteredContacts;

  return (
    <div className="flex flex-col h-full screen-enter">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center btn-press border border-border">
          <IconArrowLeft size={18} className="text-text-secondary" />
        </button>
        <h1 className="text-lg font-bold">Send Money</h1>
      </div>

      {/* Search Bar */}
      <div className="px-5 mb-4">
        <div className="relative">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search name, UPI ID, phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 p-1 bg-bg-card rounded-xl border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 btn-press ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-5">
        {activeTab === 'bank' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center mb-4">
              <span className="text-3xl">🏦</span>
            </div>
            <p className="text-sm font-bold text-text-secondary mb-1">Bank Transfer</p>
            <p className="text-xs text-text-muted px-8">Enter account number and IFSC code to transfer directly to a bank account</p>
            <div className="w-full mt-6 space-y-3">
              <input
                type="text"
                placeholder="Account Number"
                className="w-full bg-bg-card border border-border rounded-xl py-3 px-4 text-sm text-white placeholder:text-text-muted focus:border-primary/50 transition-all"
              />
              <input
                type="text"
                placeholder="IFSC Code"
                className="w-full bg-bg-card border border-border rounded-xl py-3 px-4 text-sm text-white placeholder:text-text-muted focus:border-primary/50 transition-all"
              />
              <button className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm btn-press shadow-lg shadow-primary/20">
                Verify & Proceed
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 stagger-children">
            {displayContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-card/80 transition-all duration-200 btn-press ripple-container"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: contact.color + '22', color: contact.color }}
                >
                  {contact.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold truncate">{contact.name}</p>
                  <p className="text-[11px] text-text-muted font-mono truncate">{contact.upiId}</p>
                </div>
              </button>
            ))}
            {filteredContacts.length === 0 && activeTab === 'contacts' && (
              <div className="py-12 text-center animate-fade-in">
                <p className="text-sm text-text-muted">No contacts found</p>
                <p className="text-xs text-text-muted mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
