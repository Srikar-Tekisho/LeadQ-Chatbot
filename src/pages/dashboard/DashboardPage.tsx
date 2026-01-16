import React from 'react';
import { ToastProvider } from '../../components/ToastContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Card } from '../../components/UIComponents';
import { FcLineChart, FcBriefcase, FcTodoList, FcCalendar, FcSettings } from 'react-icons/fc';
import { Bell, Search } from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Get user data from localStorage if available
  const userData = JSON.parse(localStorage.getItem('leadq_user_data') || '{}');
  const userName = userData?.profile?.fullName?.split(' ')[0] || 'User';

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Test Controls Bar */}
          <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-3 z-50 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold">📊 DASHBOARD MODULE</span>
              <span className="text-sm opacity-75">| Port 3002</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="http://localhost:3001/onboarding.html"
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Onboarding :3001
              </a>
              <a
                href="http://localhost:3003/settings.html"
                className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Settings :3003
              </a>
            </div>
          </div>

          {/* Top Navigation */}
          <header className="mt-12 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-12 z-20 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">LeadQ.AI</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg text-sm transition-all"
                />
              </div>
              <button className="text-gray-500 hover:text-gray-900 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <a href="http://localhost:3003/settings.html" className="text-gray-500 hover:text-indigo-600 transition-colors" title="Settings">
                <FcSettings size={24} />
              </a>
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
              {/* Welcome Section */}
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
                  <p className="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
                </div>
                <div className="hidden md:flex gap-3">
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                    View Reports
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm">
                    + New Campaign
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-sm font-medium">Total Leads</span>
                    <div className="p-2 bg-blue-50 rounded-lg"><FcBriefcase size={20} /></div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">1,284</div>
                  <div className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
                    <span>↑ 12%</span> <span className="text-gray-400 font-normal">vs last month</span>
                  </div>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-sm font-medium">Revenue</span>
                    <div className="p-2 bg-green-50 rounded-lg"><FcLineChart size={20} /></div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">$45.2k</div>
                  <div className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
                    <span>↑ 8.1%</span> <span className="text-gray-400 font-normal">vs last month</span>
                  </div>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-sm font-medium">Active Tasks</span>
                    <div className="p-2 bg-purple-50 rounded-lg"><FcTodoList size={20} /></div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">14</div>
                  <div className="text-gray-500 text-sm font-medium mt-2">
                    3 due today
                  </div>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-sm font-medium">Meetings</span>
                    <div className="p-2 bg-orange-50 rounded-lg"><FcCalendar size={20} /></div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">6</div>
                  <div className="text-gray-500 text-sm font-medium mt-2">
                    Next at 2:00 PM
                  </div>
                </Card>
              </div>

              {/* Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'New lead from website', time: '2 minutes ago', icon: '🎯' },
                      { action: 'Campaign "Summer Sale" started', time: '1 hour ago', icon: '🚀' },
                      { action: 'Meeting with John completed', time: '3 hours ago', icon: '✅' },
                      { action: 'New team member added', time: 'Yesterday', icon: '👋' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-left font-medium text-sm">
                      📧 Send Email Campaign
                    </button>
                    <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left font-medium text-sm">
                      ➕ Add New Lead
                    </button>
                    <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left font-medium text-sm">
                      📊 Generate Report
                    </button>
                    <a href="http://localhost:3003/settings.html" className="block w-full p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left font-medium text-sm">
                      ⚙️ Open Settings
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default DashboardPage;
