import React, { useState } from 'react';
import { Card } from './UIComponents';
import { FcLineChart, FcBriefcase, FcTodoList, FcCalendar, FcSettings } from 'react-icons/fc';
import { Bell, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MainDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
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
                    <button onClick={() => navigate('/settings')} className="text-gray-500 hover:text-indigo-600 transition-colors" title="Settings">
                        <FcSettings size={24} />
                    </button>
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        SR
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                    {/* Welcome Section */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Srikar</h1>
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

                    {/* Chart & Activity Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart Placeholder */}
                        <div className="lg:col-span-2">
                            <Card title="Traffic Overview" className="h-[400px] flex flex-col">
                                <div className="flex-1 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                    Chart Placeholder (Recharts Integration)
                                </div>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <div className="lg:col-span-1">
                            <Card title="Recent Activity" className="h-[400px] overflow-hidden flex flex-col">
                                <div className="space-y-6 overflow-y-auto pr-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 text-xs font-bold border border-indigo-100">
                                                JD
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-900 font-medium">New lead captured via Mobile App</p>
                                                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainDashboard;
