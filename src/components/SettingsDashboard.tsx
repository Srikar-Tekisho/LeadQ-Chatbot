
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProfileSection from './sections/ProfileSection';
import SecuritySection from './sections/SecuritySection';
import ReferralSection from './sections/ReferralSection';
import BillingPricingSection from './sections/BillingPricingSection';
import { NotificationsSection, AboutSection } from './sections/NotificationsAboutSection';
import AdminSection from './sections/AdminSection';
import CompanyAboutSection from './sections/CompanyAboutSection';
import { UserRole, Tab } from '../types';
import { ArrowLeft, LogOut } from 'lucide-react';

interface SettingsDashboardProps {
    onSignOut: () => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ onSignOut }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>(Tab.PROFILE);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.SUPER_ADMIN);

    // Render Content
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

    const handleLogoutClick = () => {
        onSignOut();
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Reused Sidebar from previous build */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
                setRole={setUserRole}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 capitalize flex items-center gap-2">
                            Settings
                            <span className="text-gray-300">/</span>
                            <span className="text-indigo-600">{activeTab.replace('-', ' ')}</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLogoutClick}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsDashboard;

