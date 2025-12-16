import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProfileSection from './components/sections/ProfileSection';
import SecuritySection from './components/sections/SecuritySection';
import ReferralSection from './components/sections/ReferralSection';
import BillingPricingSection from './components/sections/BillingPricingSection';
import { NotificationsSection, AboutSection } from './components/sections/NotificationsAboutSection';
import AdminSection from './components/sections/AdminSection';
import CompanyAboutSection from './components/sections/CompanyAboutSection';
import { UserRole, Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PROFILE);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SUPER_ADMIN);

  // Render Logic
  const renderContent = () => {
    switch (activeTab) {
      case Tab.PROFILE:
        return <ProfileSection userRole={userRole} />;
      case Tab.NOTIFICATIONS:
        return <NotificationsSection />;
      case Tab.SECURITY:
        return <SecuritySection userRole={userRole} />;
      case Tab.PLANS_BILLING:
        return <BillingPricingSection userRole={userRole} />;
      case Tab.ADMIN:
        return <AdminSection userRole={userRole} />;
      case Tab.REFERRAL:
        return <ReferralSection />;
      case Tab.HELP:
        return <AboutSection />;
      case Tab.ABOUT:
        return <CompanyAboutSection />;
      default:
        return <ProfileSection userRole={userRole} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setRole={setUserRole}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">{activeTab}</h1>
          <div className="flex items-center space-x-4">
            {/* Avatar component removed */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto pb-12">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
