import React, { useState } from 'react';
import { UserRole, Tab } from '../types';
import {
  User, Bell, Shield, CreditCard, UserCog, HelpCircle, Users, Info, Settings, Search, AudioWaveform
} from 'lucide-react';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  userRole: UserRole;
  setRole: (role: UserRole) => void;
}

const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, userRole, setRole }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    {
      id: Tab.PROFILE,
      label: 'Profile',
      icon: User,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['name', 'email', 'phone', 'avatar', 'photo', 'picture', 'location', 'language', 'timezone']
    },
    {
      id: Tab.NOTIFICATIONS,
      label: 'Notifications',
      icon: Bell,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['email', 'alert', 'sound', 'push', 'messages', 'communication']
    },
    {
      id: Tab.SECURITY,
      label: 'Security',
      icon: Shield,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['password', 'login', 'authentication', '2fa', 'two factor', 'privacy', 'lock', 'code']
    },
    {
      id: Tab.PLANS_BILLING,
      label: 'Plans & Billing',
      icon: CreditCard,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['credit card', 'payment', 'invoice', 'subscription', 'upgrade', 'money', 'cost', 'pricing']
    },
    {
      id: Tab.VOICE_INTEGRATION,
      label: 'Voice Integration',
      icon: AudioWaveform,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['voice', 'ai', 'assistant', 'campaigns', 'languages', 'reports', 'business hours']
    },
    {
      id: Tab.HELP,
      label: 'Help & Support',
      icon: HelpCircle,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['faq', 'contact', 'support', 'question', 'issue', 'bug', 'guide']
    },
    {
      id: Tab.REFERRAL,
      label: 'Referral',
      icon: Users,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['invite', 'share', 'bonus', 'rewards', 'friends', 'code']
    },
    {
      id: Tab.ADMIN,
      label: 'User Control',
      icon: UserCog,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      keywords: ['users', 'roles', 'permissions', 'delete account', 'admin', 'sessions', 'devices', 'logout']
    },
    {
      id: Tab.ABOUT,
      label: 'About',
      icon: Info,
      allowed: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER],
      keywords: ['version', 'legal', 'privacy policy', 'terms', 'company', 'licenses']
    },
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesRole = item.allowed.includes(userRole);
    const query = searchQuery.toLowerCase();
    const matchesSearch = item.label.toLowerCase().includes(query) || item.keywords.some(k => k.includes(query));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
          <Settings size={24} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">Settings</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-3">

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-sm"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[14px] text-sm transition-all duration-200 shadow-sm ${isActive
                  ? 'bg-[#2563EB] text-white font-bold shadow-md ring-1 ring-blue-500/20'
                  : 'bg-[#E9F1FB] text-gray-600 hover:bg-[#F2F6FC] font-medium'
                  }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">
                    <item.icon size={22} />
                  </span>
                  {item.label}
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            No settings found
          </div>
        )}
      </div>


    </div>
  );
};

export default Sidebar;
