import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../UIComponents';
import { UserRole } from '../../types';
import { FcCheckmark, FcMoneyTransfer, FcDownload, FcFlashOn, FcVip, FcPlus, FcPhoneAndroid, FcCancel, FcDocument, FcClock, FcVideoCall, FcFeedback, FcInspection, FcUp, FcDown } from 'react-icons/fc';
import { Trash2 } from 'lucide-react';

interface Props {
    userRole: UserRole;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'upi';
    title: string;
    subtitle: string;
    isPrimary: boolean;
    expiry?: string;
    brand?: 'visa' | 'mastercard' | 'amex';
}

const BillingPricingSection: React.FC<Props> = ({ userRole }) => {
    const isAdmin = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;
    const [activeTab, setActiveTab] = useState<'pricing' | 'billing' | 'credits'>('credits');
    const [showCreditHistory, setShowCreditHistory] = useState(true);

    const [isEditingBilling, setIsEditingBilling] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    // Payment Methods State
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: '1', type: 'card', title: 'Visa ending in 4242', subtitle: 'Expires 12/2028', isPrimary: true, expiry: '12/2028', brand: 'visa' },
        { id: '2', type: 'upi', title: 'alex.morgan@oksbi', subtitle: 'UPI', isPrimary: false }
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addMethodType, setAddMethodType] = useState<'card' | 'upi'>('card');

    return (
        <div className="space-y-6">
            {/* Internal Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('credits')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'credits' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FcClock size={16} />
                    Credits Usage
                </button>
                <button
                    onClick={() => setActiveTab('pricing')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'pricing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FcVip size={16} />
                    Pricing Plans
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'billing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FcDocument size={16} />
                    Billing Settings
                </button>
            </div>



            {
                activeTab === 'credits' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Usage Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Meetings */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-lg">
                                        <FcVideoCall size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MONTHLY</span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900">Meetings</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">450</span>
                                    <span className="text-gray-400 text-sm"> / 1,000 meetings</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                                <p className="text-xs text-right text-gray-500">550 meetings remaining</p>
                            </div>

                            {/* Email Campaigns */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <FcFeedback size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MONTHLY</span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900">Email Campaigns</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">1,250</span>
                                    <span className="text-gray-400 text-sm"> / 5,000 emails</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                                <p className="text-xs text-right text-gray-500">3,750 emails remaining</p>
                            </div>

                            {/* Card Scanning */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-pink-50 rounded-lg">
                                        <FcInspection size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MONTHLY</span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-900">Card Scanning</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">120</span>
                                    <span className="text-gray-400 text-sm"> / 200 scans</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                    <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                                <p className="text-xs text-right text-gray-500">80 scans remaining</p>
                            </div>
                        </div>

                        {/* Upsell Banner */}
                        <div className="bg-[#2E2E99] rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
                            <div className="relative z-10 max-w-2xl">
                                <div className="flex items-center gap-2 mb-2 text-yellow-400">
                                    <FcFlashOn size={20} />
                                    <h3 className="text-lg font-bold">Need more credits?</h3>
                                </div>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Running low on credits for the month? Purchase a top-up pack instantly to continue using premium features without interruption.
                                </p>
                            </div>
                            <div className="relative z-10 mt-6 md:mt-0">
                                <button
                                    onClick={() => setActiveTab('pricing')}
                                    className="bg-white text-[#2E2E99] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-md"
                                >
                                    View Plans
                                </button>
                            </div>
                        </div>

                        {/* Credit History Toggle */}
                        <div className="flex justify-center border-t border-gray-100 pt-6">
                            <button
                                onClick={() => setShowCreditHistory(!showCreditHistory)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {showCreditHistory ? <FcClock size={16} /> : <FcClock size={16} />}
                                {showCreditHistory ? 'Hide Credit History' : 'Show Credit History'}
                                {showCreditHistory ? <FcUp size={14} /> : <FcDown size={14} />}
                            </button>
                        </div>

                        {/* Credit History Content */}
                        {showCreditHistory && (
                            <Card title="Credit History">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Date</th>
                                                <th className="px-6 py-4 text-left">Service</th>
                                                <th className="px-6 py-4 text-right">Change</th>
                                                <th className="px-6 py-4 text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {[
                                                { date: 'Feb 12, 2024', service: 'Meetings', sub: 'Usage', change: '-15 meetings', bal: '550 meetings', neg: true },
                                                { date: 'Feb 10, 2024', service: 'Email Campaigns', sub: 'Usage', change: '-250 emails', bal: '3,750 emails', neg: true },
                                                { date: 'Feb 08, 2024', service: 'Card Scanning', sub: 'Usage', change: '-5 scans', bal: '80 scans', neg: true },
                                                { date: 'Feb 01, 2024', service: 'Monthly Allocation', sub: 'Credit', change: '+1,000 meetings', bal: '1,000 meetings', neg: false },
                                                { date: 'Feb 01, 2024', service: 'Monthly Allocation', sub: 'Credit', change: '+5,000 emails', bal: '5,000 emails', neg: false },
                                            ].map((row, i) => (
                                                <tr key={i} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.date}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{row.service}</div>
                                                        <div className="text-xs text-gray-400">{row.sub}</div>
                                                    </td>
                                                    <td className={`px-6 py-4 text-right text-sm font-medium ${row.neg ? 'text-gray-900' : 'text-green-600'}`}>
                                                        {row.change}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                        {row.bal}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="py-4 text-center border-t border-gray-100">
                                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide">Load More Activity</button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )
            }

            {
                activeTab === 'pricing' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center gap-2 text-slate-900">
                            <h2 className="text-xl font-bold">Current Subscription</h2>
                        </div>

                        {/* Current Plan Card */}
                        <div className="bg-[#F5F8FF] rounded-2xl p-8 border border-blue-50 shadow-sm">
                            {/* Top Row */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-slate-900">Pro Plan</h3>
                                        <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-bold tracking-wide">Active</span>
                                    </div>
                                    <p className="text-slate-500 font-medium">
                                        $29/month • Next billing: 2024-02-15
                                    </p>
                                </div>

                                {isAdmin && (
                                    <div className="flex items-center gap-3">
                                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm">
                                            <FcFlashOn size={16} />
                                            Upgrade
                                        </button>
                                        <button className="px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm">
                                            Cancel Subscription
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Usage Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                                {/* Meetings Metric */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                                        <span>Meetings</span>
                                        <span className="text-slate-900">45/100</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-[#1E3A8A] rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-400 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>

                                {/* Contacts Metric */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                                        <span>Contacts</span>
                                        <span className="text-slate-900">234/500</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-[#1E3A8A] rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-400 rounded-full" style={{ width: '47%' }}></div>
                                    </div>
                                </div>

                                {/* Storage Metric */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                                        <span>Storage</span>
                                        <span className="text-slate-900">1.2GB/5GB</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-[#1E3A8A] rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-400 rounded-full" style={{ width: '24%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Compare Plans Section */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                                    <button
                                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${billingCycle === 'annual' ? 'bg-slate-900' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>Annual</span>

                                    {billingCycle === 'annual' && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Save 15%</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Free Plan */}
                                <div className="bg-[#F5F8FF] rounded-2xl p-6 border border-transparent flex flex-col">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Free</h4>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-bold text-gray-900">$0</span>
                                        <span className="text-gray-500 ml-1 text-sm">/month</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {['Up to 10 meetings/month', '50 contacts', 'Basic analytics', 'Email support'].map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 flex-shrink-0 mt-0.5"><FcCheckmark size={18} /></span>
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full py-3 rounded-xl bg-[#E2E8F0] text-slate-700 font-semibold text-sm hover:bg-slate-300 transition-colors">
                                        Upgrade
                                    </button>
                                </div>

                                {/* Pro Plan (Highlighted) */}
                                <div className="bg-white rounded-2xl p-6 border-2 border-sky-400 relative shadow-sm flex flex-col">
                                    <div className="absolute -top-3 left-6">
                                        <span className="bg-sky-400 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2 mt-2">Pro</h4>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {billingCycle === 'monthly' ? '$29' : '$290'}
                                        </span>
                                        <span className="text-gray-500 ml-1 text-sm">{billingCycle === 'monthly' ? '/month' : '/year'}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {['100 meetings/month', '500 contacts', 'Advanced analytics', 'Priority support', 'Calendar integrations', 'Custom branding'].map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 flex-shrink-0 mt-0.5"><FcCheckmark size={18} /></span>
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full py-3 rounded-xl bg-[#F1F5F9] text-slate-400 font-semibold text-sm cursor-default" disabled>
                                        Current Plan
                                    </button>
                                </div>

                                {/* Enterprise Plan */}
                                <div className="bg-[#F5F8FF] rounded-2xl p-6 border border-transparent flex flex-col">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Enterprise</h4>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {billingCycle === 'monthly' ? '$99' : '$990'}
                                        </span>
                                        <span className="text-gray-500 ml-1 text-sm">{billingCycle === 'monthly' ? '/month' : '/year'}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {['Unlimited meetings', 'Unlimited contacts', 'Full analytics suite', '24/7 support', 'All integrations', 'Custom branding', 'Team management', 'SSO & Security'].map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 flex-shrink-0 mt-0.5"><FcCheckmark size={18} /></span>
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full py-3 rounded-xl bg-[#E2E8F0] text-slate-700 font-semibold text-sm hover:bg-slate-300 transition-colors">
                                        Upgrade
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {activeTab === 'billing' && (
                <div className="space-y-6 relative animate-fade-in">
                    <Card title="Payment Method" description="Manage your payment instruments and billing details.">
                        {/* Action Bar */}
                        <div className="flex justify-end -mt-16 mb-6">
                            {isAdmin && (
                                !isEditingBilling
                                    ? <Button onClick={() => setIsEditingBilling(true)} variant="secondary" size="sm">Edit Details</Button>
                                    : <div className="flex space-x-2">
                                        <Button onClick={() => setIsEditingBilling(false)} variant="ghost" size="sm">Cancel</Button>
                                        <Button onClick={() => setIsEditingBilling(false)} variant="primary" size="sm">Save</Button>
                                    </div>
                            )}
                        </div>

                        {/* Payment Methods List */}
                        <div className="space-y-3 mb-8">
                            {paymentMethods.map((method) => (
                                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-3 rounded-md ${method.type === 'card' ? 'bg-gray-100' : 'bg-green-50'}`}>
                                            {method.type === 'card' ? <FcMoneyTransfer size={24} /> : <FcPhoneAndroid size={24} />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{method.title}</div>
                                            <div className="text-sm text-gray-500">{method.subtitle}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {method.isPrimary ? (
                                            <Badge variant="neutral">Primary</Badge>
                                        ) : (
                                            isAdmin && (
                                                <>
                                                    <button className="text-sm text-blue-600 font-medium hover:underline">Set Primary</button>
                                                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isAdmin && (
                                <button
                                    className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all font-medium"
                                >
                                    <span className="mr-2"><FcPlus size={20} /></span> Add Payment Method
                                </button>
                            )}
                        </div>

                        <div className="border-t border-gray-100 my-6"></div>

                        {/* Billing Information Inputs */}
                        <h4 className="text-md font-bold text-gray-900 mb-4">Billing Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Billing Name" value="Nexus Inc." disabled={!isEditingBilling} />
                            <Input label="Billing Email" value="billing@nexus.example.com" disabled={!isEditingBilling} />
                            <Input label="Address" value="123 Tech Blvd" disabled={!isEditingBilling} />
                            <Input label="Tax ID / VAT" value="US-99922211" disabled={!isEditingBilling} />
                        </div>
                    </Card>

                    <Card title="Billing History">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">Dec 01, 2025</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">$49.00</td>
                                    <td className="px-6 py-4"><Badge variant="success">Paid</Badge></td>
                                    <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm"><FcDownload size={14} /></Button></td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-gray-900">Nov 01, 2025</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">$49.00</td>
                                    <td className="px-6 py-4"><Badge variant="success">Paid</Badge></td>
                                    <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm"><FcDownload size={14} /></Button></td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>

                    {/* Add Payment Method Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900">Add Payment Method</h3>
                                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <FcCancel size={24} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Type Toggle */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                                        <button
                                            onClick={() => setAddMethodType('card')}
                                            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${addMethodType === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <span className="mr-2"><FcMoneyTransfer size={16} /></span> Card
                                        </button>
                                        <button
                                            onClick={() => setAddMethodType('upi')}
                                            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${addMethodType === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <span className="mr-2"><FcPhoneAndroid size={16} /></span> UPI
                                        </button>
                                    </div>

                                    {addMethodType === 'card' ? (
                                        <div className="space-y-4">
                                            <Input label="Card Number" placeholder="0000 0000 0000 0000" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Expiry Date" placeholder="MM/YY" />
                                                <Input label="CVC" placeholder="123" />
                                            </div>
                                            <Input label="Cardholder Name" placeholder="Name on card" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mb-4">
                                                Enter your UPI ID (VPA) to link your bank account securely.
                                            </div>
                                            <Input label="UPI ID" placeholder="username@bankname" />
                                        </div>
                                    )}

                                    <div className="mt-8 flex gap-3">
                                        <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                        <Button variant="primary" className="flex-1" onClick={() => setShowAddModal(false)}>Add Method</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default BillingPricingSection;
