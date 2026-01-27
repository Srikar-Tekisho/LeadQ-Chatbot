import React, { useState } from 'react';
import { Card, Button, Input, Select, Toggle, Badge } from '../UIComponents';
import { Zap, Mic, Globe, Clock, BarChart3, Plus, Play, MoreVertical, FileText, FileSpreadsheet } from 'lucide-react';

const VoiceIntegrationSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ai_assistant' | 'campaigns' | 'business_hours' | 'languages' | 'reports'>('ai_assistant');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-100 p-1.5 rounded-lg inline-flex flex-wrap gap-1 items-center mb-6">
                {[
                    { id: 'ai_assistant', label: 'AI Assistant', icon: Zap },
                    { id: 'campaigns', label: 'Campaigns', icon: Mic },
                    { id: 'business_hours', label: 'Business Hours', icon: Clock },
                    { id: 'languages', label: 'Languages', icon: Globe },
                    { id: 'reports', label: 'Reports', icon: BarChart3 },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === item.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                            }`}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="mt-4">
                {activeTab === 'ai_assistant' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="AI Voice Assistant Configuration" description="Configure how your AI assistant sounds and behaves during calls.">
                            <div className="grid grid-cols-1 gap-6">
                                { /* Features removed as per request */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Message</label>
                                    <textarea
                                        rows={3}
                                        className="block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        defaultValue="Hello! This is [Assistant Name] from LeadQ. How can I help you today?"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button>Save Configuration</Button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'campaigns' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="Campaign Settings" description="Configure outbound call rules">
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium text-gray-900">Confirmation Calls</span>
                                        <span className="text-sm text-gray-500 mt-1">Trigger immediately on new bookings</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                                        role="switch"
                                        aria-checked="true"
                                    >
                                        <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium text-gray-900">Meeting Reminders</span>
                                        <span className="text-sm text-gray-500 mt-1">Call before scheduled meetings</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600"
                                        role="switch"
                                        aria-checked="true"
                                    >
                                        <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">REMINDER SCHEDULE</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24">
                                            <Input
                                                label=""
                                                type="number"
                                                defaultValue="4"
                                                className="text-center font-bold"
                                            />
                                        </div>
                                        <span className="text-gray-600 font-medium">Hours before meeting</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'business_hours' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="Business Hours & Availability" description="Set the times when your voice assistant is active to make calls.">
                            <div className="space-y-4">
                                <Select
                                    label="Timezone"
                                    options={[
                                        { value: 'UTC', label: 'UTC' },
                                        { value: 'ET', label: 'Eastern Time (ET)' },
                                        { value: 'PT', label: 'Pacific Time (PT)' },
                                    ]}
                                    defaultValue="UTC"
                                />
                                <div className="border-t border-gray-100 pt-4">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                        <div key={day} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                <span className="text-sm font-medium text-gray-700 w-24">{day}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    defaultValue="09:00"
                                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 cursor-pointer"
                                                    onClick={(e) => e.currentTarget.showPicker()}
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input
                                                    type="time"
                                                    defaultValue="17:00"
                                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 cursor-pointer"
                                                    onClick={(e) => e.currentTarget.showPicker()}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button>Save Schedule</Button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'languages' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="Language Settings" description="Manage languages supported by your voice assistant.">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">PRIMARY LANGUAGE</label>
                                    <Select
                                        label=""
                                        options={[
                                            { value: 'en-US', label: 'English (US)' },
                                            { value: 'es', label: 'Spanish' },
                                            { value: 'de', label: 'German' },
                                            { value: 'fr', label: 'French' },
                                            { value: 'hi', label: 'Hindi' },
                                        ]}
                                        defaultValue="en-US"
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-bold text-blue-600 uppercase">ACTIVE</span>
                                    </div>
                                    <p className="text-gray-600 text-sm">System is optimized for English voice synthesis and recognition.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="Automated Reports" description="Configure report generation">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <FileText className="text-yellow-700" size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">Weekly PDF</h3>
                                    <p className="text-sm text-gray-500">Scheduled every Monday</p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="text-yellow-700" size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">Export CSV</h3>
                                    <p className="text-sm text-gray-500">Download on-demand</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceIntegrationSection;
