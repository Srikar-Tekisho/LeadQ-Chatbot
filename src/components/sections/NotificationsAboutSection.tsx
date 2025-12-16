import React, { useState } from 'react';
import { Card, Toggle, Button, Input, TextArea, Select } from '../UIComponents';
import { FcFeedback, FcComments, FcExport, FcCheckmark as FcSent, FcQuestions, FcDown, FcUp, FcAlarmClock, FcClock, FcHighPriority, FcAbout, FcFlashOn, FcPlus, FcInspection, FcCancel, FcIdea } from 'react-icons/fc';
import { Pencil, Trash2, Send, X } from 'lucide-react';

// --- Notifications Section ---
export const NotificationsSection: React.FC = () => {
  // Master Toggle State
  const [pushEnabled, setPushEnabled] = useState(true);

  // Notification Types State
  const [notifySettings, setNotifySettings] = useState({
    meetingReminders: true,
    accountAlerts: false,
    systemAnnouncements: false,
    productUpdates: true,
  });

  // Meeting Timers State
  const [timers, setTimers] = useState<number[]>([15, 60]);
  const [newTimerVal, setNewTimerVal] = useState('');

  const handleAddTimer = () => {
    const val = parseInt(newTimerVal);
    if (!isNaN(val) && val > 0 && !timers.includes(val)) {
      setTimers([...timers, val].sort((a, b) => a - b));
      setNewTimerVal('');
    }
  };

  const removeTimer = (val: number) => {
    setTimers(timers.filter(t => t !== val));
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Push Notifications Card */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <FcAlarmClock size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Push Notifications</h2>
              <p className="text-sm text-gray-500">Receive alerts on your device.</p>
            </div>
          </div>
          {/* Master Toggle */}
          <div
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${pushEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${pushEnabled ? 'translate-x-7' : ''}`}></div>
          </div>
        </div>

        {pushEnabled && (
          <div className="mt-8 space-y-2 animate-fade-in">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Notify Me About</p>

            {/* Notification Options */}
            <div
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border ${notifySettings.meetingReminders ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent hover:bg-gray-50'}`}
              onClick={() => setNotifySettings(p => ({ ...p, meetingReminders: !p.meetingReminders }))}
            >
              <div className="flex items-center gap-3">
                <FcClock size={18} />
                <span className={`text-sm font-medium ${notifySettings.meetingReminders ? "text-blue-900" : "text-gray-700"}`}>Meeting reminders</span>
              </div>
              {notifySettings.meetingReminders && <div className="text-blue-600">✓</div>}
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border ${notifySettings.accountAlerts ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent hover:bg-gray-50'}`}
              onClick={() => setNotifySettings(p => ({ ...p, accountAlerts: !p.accountAlerts }))}
            >
              <div className="flex items-center gap-3">
                <FcHighPriority size={18} />
                <span className={`text-sm font-medium ${notifySettings.accountAlerts ? "text-blue-900" : "text-gray-700"}`}>Account alerts</span>
              </div>
              {notifySettings.accountAlerts && <div className="text-blue-600">✓</div>}
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border ${notifySettings.systemAnnouncements ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent hover:bg-gray-50'}`}
              onClick={() => setNotifySettings(p => ({ ...p, systemAnnouncements: !p.systemAnnouncements }))}
            >
              <div className="flex items-center gap-3">
                <FcAbout size={18} />
                <span className={`text-sm font-medium ${notifySettings.systemAnnouncements ? "text-blue-900" : "text-gray-700"}`}>System announcements</span>
              </div>
              {notifySettings.systemAnnouncements && <div className="text-blue-600">✓</div>}
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border ${notifySettings.productUpdates ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent hover:bg-gray-50'}`}
              onClick={() => setNotifySettings(p => ({ ...p, productUpdates: !p.productUpdates }))}
            >
              <div className="flex items-center gap-3">
                <FcFlashOn size={18} />
                <span className={`text-sm font-medium ${notifySettings.productUpdates ? "text-blue-900" : "text-gray-700"}`}>Product updates</span>
              </div>
              {notifySettings.productUpdates && <div className="text-blue-600">✓</div>}
            </div>
          </div>
        )}
      </Card>

      {/* Meeting Timer Configuration */}
      <Card title="Meeting Timer Configuration" description="Customize when you receive your meeting alerts.">
        <div className="space-y-3 mt-2">
          {timers.map((time) => (
            <div key={time} className="group flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-sm font-semibold text-blue-900">
                {time} minutes before meeting
              </span>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Note: Edit functionality is tricky for simple numbers, usually you delete and re-add, but we will show the icon as requested */}
                <button className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors" title="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => removeTimer(time)}
                  className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Add Custom Timer */}
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-lg mt-4">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Add Custom Timer</span>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={newTimerVal}
                  onChange={(e) => setNewTimerVal(e.target.value)}
                  className="w-16 bg-slate-800 text-white border-slate-700 rounded px-2 py-1 text-center font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="00"
                />
              </div>
              <span className="text-xs font-bold text-slate-400">MINS</span>
              <button
                onClick={handleAddTimer}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                <FcPlus size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={() => alert("Preferences Saved")}>Save Preferences</Button>
      </div>
    </div>
  );
};

// --- FAQ Item Component ---
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none group"
      >
        <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
          {question}
        </span>
        {isOpen ? (
          <FcUp size={16} />
        ) : (
          <FcDown size={16} />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};

// --- About Section (Help & Support) ---
export const AboutSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'email' | 'faq' | 'feedback'>('faq');
  const [supportForm, setSupportForm] = useState({ category: 'Technical', priority: 'Medium', subject: '', desc: '' });
  const [isChatOpen, setIsChatOpen] = useState(false);

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by going to the Security tab and clicking on 'Set Password'. If you cannot log in, use the 'Forgot Password' link on the login page."
    },
    {
      question: "Where can I find my invoices?",
      answer: "Invoices are available in the Plans & Billing tab under the 'Billing History' section. You can download PDF copies of all past transactions."
    },
    {
      question: "How do I add a new user to my team?",
      answer: "To add a new user, navigate to the Team Management section (available for Admin roles). Click 'Add Member' and enter their email address to send an invitation."
    },
    {
      question: "Can I change my subscription plan?",
      answer: "Yes, go to Plans & Billing > Pricing Plans. You can upgrade or downgrade your plan at any time. Changes typically take effect immediately."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, Amex) and UPI payments. You can manage your payment methods in the Billing Settings tab."
    }
  ];

  return (
    <div className="space-y-6 relative">
      {/* Navigation Tabs */}
      {/* Navigation Tabs - Pill Design */}
      <div className="bg-gray-100 p-1.5 rounded-lg inline-flex flex-wrap gap-1 items-center mb-6">
        {[
          { id: 'faq', label: 'FAQs', icon: <FcQuestions size={18} /> },
          { id: 'contact', label: 'Raise a Ticket', icon: <FcInspection size={18} /> },
          { id: 'email', label: 'Email Support', icon: <FcFeedback size={18} /> },
          { id: 'feedback', label: 'Feedback', icon: <FcIdea size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}

        {/* Chatbot Button (Action) */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all duration-200"
        >
          <FcComments size={18} />
          <span>Chatbot</span>
        </button>
      </div>

      {/* Dynamic Content */}
      <Card className="animate-fade-in min-h-[400px]">
        {activeTab === 'faq' && (
          <div className="max-w-2xl mx-auto py-2">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
              <p className="text-gray-500 mt-2">Find answers to the most common questions about our platform.</p>
            </div>
            <div className="space-y-1">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-800">Can't find what you're looking for?</p>
              <button onClick={() => setIsChatOpen(true)} className="text-blue-600 font-bold text-sm hover:underline mt-1">Contact Support</button>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="max-w-2xl mx-auto py-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Submit a Ticket</h3>
              <span className="text-sm text-gray-500">Response time: ~4 hours</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={[{ value: 'Technical', label: 'Technical Issue' }, { value: 'Billing', label: 'Billing Issue' }, { value: 'Feature', label: 'Feature Request' }]}
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                />
                <Select
                  label="Priority"
                  options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent' }]}
                  value={supportForm.priority}
                  onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                />
              </div>
              <Input
                label="Subject"
                value={supportForm.subject}
                onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                placeholder="Brief summary of the issue"
              />
              <TextArea
                label="Description"
                rows={5}
                value={supportForm.desc}
                onChange={e => setSupportForm({ ...supportForm, desc: e.target.value })}
                placeholder="Detailed explanation..."
              />

              <div className="flex justify-end pt-4">
                <Button onClick={() => alert("Ticket Created! Reference #9921")} className="w-full sm:w-auto flex items-center">
                  <span className="mr-2"><FcSent size={16} /></span> Submit Ticket
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="max-w-xl mx-auto py-12 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FcFeedback size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Us Directly</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              For general inquiries, partnership opportunities, or if you simply prefer email, our team is ready to help. We aim to respond to all emails within 24 hours.
            </p>

            <div className="bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 inline-flex flex-col items-center mb-8">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Support Email</span>
              <span className="font-mono text-xl font-medium text-gray-900 select-all">support@nexus.com</span>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => window.open('mailto:support@nexus.com')} className="flex items-center px-8 py-3">
                <span className="mr-2"><FcExport size={18} /></span>
                Open Email Client
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="max-w-2xl mx-auto py-2">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FcIdea size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Share Your Feedback</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">We value your input! Let us know what you like, what needs improvement, or any ideas you have.</p>
            </div>

            <div className="space-y-6">
              <Select
                label="Topic"
                options={[
                  { value: 'General', label: 'General Feedback' },
                  { value: 'UI/UX', label: 'User Interface / Experience' },
                  { value: 'Performance', label: 'Performance / Speed' },
                  { value: 'Feature', label: 'New Feature Idea' },
                  { value: 'Other', label: 'Other' }
                ]}
                value="General"
                onChange={() => { }}
              />
              <TextArea
                label="Your Thoughts"
                rows={6}
                placeholder="Tell us more..."
                value=""
                onChange={() => { }}
              />

              <div className="flex justify-end pt-2">
                <Button onClick={() => alert("Thank you for your feedback!")} className="w-full sm:w-auto">
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Chatbot Modal Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsChatOpen(false)}
          ></div>

          {/* Modal Window */}
          <div className="relative bg-white w-full max-w-lg h-[650px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up transform scale-100 transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <FcComments size={24} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-indigo-600 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">LeadQ Assistant</h3>
                  <p className="text-blue-100 text-xs">Always online • Replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
              >
                <X size={20} className="text-red-600" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <FcComments size={18} />
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <span className="text-xs text-gray-400 ml-1">LeadQ Assistant • Just now</span>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 leading-relaxed">
                    Hello! 👋 How can I help you regarding your settings, billing, or account today?
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <FcComments size={18} />
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <span className="text-xs text-gray-400 ml-1">LeadQ Assistant • Just now</span>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-800 leading-relaxed">
                    You can ask me about:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                      <li>Resetting your password</li>
                      <li>Upgrading your plan</li>
                      <li>Adding team members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  autoFocus
                />
                <button className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                  <Send size={20} className="text-white ml-1" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Powered by LeadQ AI Support</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
