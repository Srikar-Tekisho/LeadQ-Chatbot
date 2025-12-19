import React, { useState } from 'react';
import { Card, Toggle, Button, Input, TextArea, Select } from '../UIComponents';
import { FcFeedback, FcComments, FcExport, FcCheckmark as FcSent, FcQuestions, FcDown, FcUp, FcAlarmClock, FcClock, FcHighPriority, FcAbout, FcFlashOn, FcPlus, FcInspection, FcCancel, FcIdea, FcCustomerSupport } from 'react-icons/fc';
import { Pencil, Trash2, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// --- Local Knowledge Base (Simulated RAG Source) ---
const KNOWLEDGE_BASE = [
  { keywords: ['pricing', 'cost', 'plan', 'billing'], answer: "We offer Free, Pro ($29/mo), and Enterprise ($99/mo) plans. You can view details in the 'Pricing Plans' tab.", category: 'Billing' },
  { keywords: ['password', 'reset', 'login', 'access'], answer: "You can change your password in the Security section. usage: Go to Security > Password > Edit.", category: 'Security' },
  { keywords: ['referral', 'invite', 'commission'], answer: "Earn 500 demo credits for every friend you invite. Check the 'Referral' section for your unique code.", category: 'Growth' },
  { keywords: ['api', 'key', 'developer'], answer: "API keys are available for Admin users in the 'Integrations' panel (coming soon).", category: 'Technical' },
  { keywords: ['receipt', 'invoice', 'history'], answer: "All past invoices are downloadable from the 'Billing History' table in the Billing section.", category: 'Billing' }
];

// --- Notifications Section (Main Wrapper) ---
// We accept 'context' props to make the bot aware of where the user is
interface NotificationsSectionProps {
  currentContext?: string; // e.g., 'billing', 'profile', 'security'
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({ currentContext = 'general' }) => {
  const [loading, setLoading] = useState(false);
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

  // Fetch Settings on Mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setPushEnabled(data.push_enabled);
          setNotifySettings({
            meetingReminders: data.meeting_reminders,
            accountAlerts: data.account_alerts,
            systemAnnouncements: data.system_announcements,
            productUpdates: data.product_updates,
          });
          if (data.timers && Array.isArray(data.timers)) {
            setTimers(data.timers);
          }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const updates = {
        user_id: user.id,
        push_enabled: pushEnabled,
        meeting_reminders: notifySettings.meetingReminders,
        account_alerts: notifySettings.accountAlerts,
        system_announcements: notifySettings.systemAnnouncements,
        product_updates: notifySettings.productUpdates,
        timers: timers,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('notification_settings').upsert(updates);
      if (error) throw error;

      alert("Preferences Saved Successfully!");
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert("Failed to save settings: " + error.message);
    } finally {
      setLoading(false);
    }
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
        <div className="flex justify-end pt-4">
          <Button onClick={handleSavePreferences} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- FAQ Item Component ---
const FAQItem: React.FC<{ question: string; answer: React.ReactNode; isOpen: boolean; onClick: () => void }> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onClick}
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
  const [feedbackForm, setFeedbackForm] = useState({ topic: 'General', message: '' });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqCategory, setFaqCategory] = useState('General');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // --- Chatbot Logic (Moved from NotificationsSection) ---
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; source?: string }[]>([
    { role: 'assistant', content: "Hello! I am your dedicated LeadQ Support Agent. How can I assist you with your account, billing, or technical queries today?" }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulated RAG Retrieval
  const retrieveAnswer = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const match = KNOWLEDGE_BASE.find(item => item.keywords.some(k => lowerQuery.includes(k)));

    if (match) return { text: match.answer, source: 'Knowledge Base' };

    if (lowerQuery.includes('ticket') || lowerQuery.includes('support')) {
      return { text: "You can raise a support ticket right here. Click the 'Raise a Ticket' tab above.", source: 'System' };
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const retrieval = retrieveAnswer(userText);
      let botResponse = "";
      let source = "";

      if (retrieval) {
        botResponse = retrieval.text;
        source = retrieval.source;
      } else {
        botResponse = "I apologize, but I don't have the specific details for that in my immediate records. To ensure this is resolved correctly, I recommend raising a formal support ticket so our technical team can investigate.";
        source = "Support Agent";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: botResponse, source }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleTicketSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        category: supportForm.category,
        priority: supportForm.priority,
        subject: supportForm.subject,
        description: supportForm.desc,
      });

      if (error) throw error;

      alert("Ticket Created Successfully! We'll get back to you shortly.");
      setSupportForm({ category: 'Technical', priority: 'Medium', subject: '', desc: '' });
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('feedback_submissions').insert({
        user_id: user.id,
        topic: feedbackForm.topic,
        message: feedbackForm.message,
      });

      if (error) throw error;

      alert("Thank you for your feedback! We appreciate it.");
      setFeedbackForm({ topic: 'General', message: '' });
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    // --- General ---
    {
      category: 'General',
      question: "What exactly is LeadQ.ai?",
      answer: (
        <div className="space-y-2">
          <p>LeadQ.ai is an <strong>AI-native sales intelligence platform</strong> designed to automate the manual "shadow work" of sales. We call it the <strong>"Handshake to Inbox" bridge</strong>.</p>
          <p>It handles everything from:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Scanning business cards instantly.</li>
            <li>Researching prospects in real-time.</li>
            <li>Capturing meeting notes.</li>
            <li>Drafting personalized follow-up emails automatically.</li>
          </ul>
        </div>
      )
    },
    {
      category: 'General',
      question: "How is LeadQ.ai different from a standard CRM?",
      answer: (
        <div className="space-y-2">
          <p>A CRM is a <em>system of record</em> (storing data), whereas LeadQ.ai is a <em>system of action</em> (creating data).</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>CRM:</strong> Records history (what happened).</li>
            <li><strong>LeadQ.ai:</strong> Drives action. We focus on high-friction moments—like trade shows and discovery calls—to ensure accurate capabilities and instant follow-ups.</li>
          </ul>
        </div>
      )
    },
    {
      category: 'General',
      question: "Who is LeadQ.ai designed for?",
      answer: (
        <p>
          LeadQ.ai is built for <strong>B2B sales professionals, account executives, and founders</strong> who spend significant time meeting prospects. It is especially powerful for teams attending conferences, trade shows, and networking events where speed and context are critical.
        </p>
      )
    },
    {
      category: 'General',
      question: "Can I use LeadQ.ai on mobile devices?",
      answer: (
        <p>
          <strong>Yes.</strong> LeadQ.ai is fully optimized for mobile web browsers, allowing you to capture leads and record meetings on the go. A dedicated mobile app for iOS and Android is also on our roadmap for seamless offline access.
        </p>
      )
    },
    {
      category: 'General',
      question: "Is there a free trial available?",
      answer: (
        <p>
          Yes! We offer a <strong>14-day free trial</strong> with full access to all Pro features, including unlimited business card scans and AI research summaries. No credit card is required to start exploring.
        </p>
      )
    },


    // --- Lead Capture ---
    {
      category: 'Lead Capture',
      question: "Can I scan double-sided or non-standard business cards?",
      answer: (
        <div className="space-y-2">
          <p><strong>Yes.</strong> Our <strong>Multi-Image Capture</strong> feature supports real-world scenarios.</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Upload up to <strong>five images</strong> per contact.</li>
            <li>Capture front and back of cards.</li>
            <li>Scan related brochures or handwritten notes.</li>
          </ul>
          <p>Our AI vision engine merges all extracted text into a single, clean contact profile.</p>
        </div>
      )
    },
    {
      category: 'Lead Capture',
      question: "What if someone doesn’t have a business card?",
      answer: (
        <div className="space-y-2">
          <p>LeadQ.ai offers four flexible ways to capture a lead:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>OCR:</strong> Scan a physical business card.</li>
            <li><strong>QR Code:</strong> Scan a digital vCard or QR code immediately.</li>
            <li><strong>NFC:</strong> Tap against NFC-enabled digital digital cards.</li>
            <li><strong>Manual Entry:</strong> Use our fast, validation-checked form.</li>
          </ul>
        </div>
      )
    },
    {
      category: 'Lead Capture',
      question: "How do I save scanned contacts to my phone?",
      answer: (
        <p>
          Every contact profile includes a <strong>"Save to Phone"</strong> button. This generates a standard <code>.vcf</code> (vCard) file that opens instantly on iOS or Android, allowing you to add the contact directly to your native address book.
        </p>
      )
    },
    {
      category: 'Lead Capture',
      question: "How does the OCR accuracy handle handwriting?",
      answer: (
        <p>
          Our AI is trained to recognize <strong>handwritten notes</strong> on business cards with high accuracy. While typed text is near-perfect, legible handwriting is typically captured correctly and added to the "Notes" section of the contact profile.
        </p>
      )
    },
    {
      category: 'Lead Capture',
      question: "Can I export my captured leads to a CSV?",
      answer: (
        <p>
          Yes. You can select multiple contacts from your dashboard and choose <strong>Export &gt; CSV</strong>. This file is formatted to be easily imported into Excel, Google Sheets, or any other CRM or marketing tool.
        </p>
      )
    },

    // --- Research ---
    {
      category: 'Research',
      question: "What is the Research Agent and where does it get data?",
      answer: (
        <div className="space-y-2">
          <p>The Research Agent is your autonomous analyst. After a lead is captured, it searches public sources in real-time, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Company websites</li>
            <li>LinkedIn profiles</li>
            <li>Relevant news articles</li>
            <li>Public business registries</li>
          </ul>
          <p>It produces a concise summary of the person and their company so you can be prepared instantly.</p>
        </div>
      )
    },
    {
      category: 'Research',
      question: "How reliable is the AI-generated information?",
      answer: (
        <div className="space-y-2">
          <p>We prioritize transparency. Each research output includes a <strong>Confidence Score</strong>:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><span className="text-green-600 font-bold">High:</span> Verified across multiple authoritative sources.</li>
            <li><span className="text-yellow-600 font-bold">Medium:</span> Found in limited sources; worth verifying.</li>
            <li><span className="text-red-600 font-bold">Low:</span> Limited public data available (flagged as "Limited verified info").</li>
          </ul>
        </div>
      )
    },
    {
      category: 'Research',
      question: "How long does the research process take?",
      answer: (
        <p>
          Research is typically completed within <strong>30 to 60 seconds</strong> after capturing a lead. You will receive a notification once the intelligence briefing is ready to view.
        </p>
      )
    },
    {
      category: 'Research',
      question: "Can I manually edit the research summary?",
      answer: (
        <p>
          <strong>Yes.</strong> If you have insider knowledge or find more specific details, you can click "Edit" on any profile to manually update the summary, job title, or company details. The AI will respect these manual overrides in future drafts.
        </p>
      )
    },
    {
      category: 'Research',
      question: "Does the Research Agent work for private companies?",
      answer: (
        <p>
          Yes, but the depth of information depends on their online footprint. For private companies, the agent focuses on their website, press releases, and available social media presence to construct the best possible profile.
        </p>
      )
    },

    // --- Meetings ---
    {
      category: 'Meetings',
      question: "Does LeadQ.ai support in-person and virtual meetings?",
      answer: (
        <div className="space-y-2">
          <p>Yes, we support both workflows seamlessly:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>In-Person (Offline):</strong> Use your phone's microphone to record face-to-face conversations securely.</li>
            <li><strong>Virtual (Online):</strong> Generate links for Google Meet or Microsoft Teams that automatically record and transcribe the session.</li>
          </ul>
        </div>
      )
    },
    {
      category: 'Meetings',
      question: "Do I need to record the entire meeting to get a summary?",
      answer: (
        <p>
          No. While audio recordings provide the most detail, you can also enter <strong>Manual Notes</strong> during or after the meeting. The AI will generate a formal Minutes of Meeting (MoM) and extract action items from your typed notes just as effectively.
        </p>
      )
    },
    {
      category: 'Meetings',
      question: "Can I take photos during meetings?",
      answer: (
        <div className="space-y-2">
          <p>Yes. We call these <strong>Memory Anchors</strong>. You can attach:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Whiteboard photos</li>
            <li>Sketches or diagrams</li>
            <li>Meeting selfies with the client</li>
          </ul>
          <p>These are stored with the meeting record and can be referenced in follow-up emails.</p>
        </div>
      )
    },
    {
      category: 'Meetings',
      question: "What languages does the transcription support?",
      answer: (
        <p>
          Currently, LeadQ.ai supports transcription in <strong>English, Spanish, French, and German</strong>. We are actively adding support for more languages to help global sales teams.
        </p>
      )
    },
    {
      category: 'Meetings',
      question: "How long are meeting recordings stored?",
      answer: (
        <p>
          Recordings are stored securely for <strong>90 days</strong> by default, allowing you enough time to review and process them. Transcripts and summaries are stored indefinitely as long as your account is active.
        </p>
      )
    },

    // --- Follow-ups ---
    {
      category: 'Follow-ups',
      question: "How does the AI know what to include in follow-ups?",
      answer: (
        <div className="space-y-2">
          <p>LeadQ.ai analyzes the <strong>meeting context</strong> (transcript or notes) to identify:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Key discussion points & pain points.</li>
            <li>Agreed-upon pricing or timelines.</li>
            <li>Specific next steps.</li>
          </ul>
          <p>It then drafts a personalized email referencing these facts, making it feel human and attentive.</p>
        </div>
      )
    },
    {
      category: 'Follow-ups',
      question: "Can I customize the tone of AI-generated drafts?",
      answer: (
        <p>
          Yes. In <strong>Settings → Prompts</strong>, you can customize the system prompt. For example, you can instruct the AI to be "Concise and direct" or "Warm and conversational," or to always include a link to your calendar.
        </p>
      )
    },
    {
      category: 'Follow-ups',
      question: "Can I schedule emails to be sent later?",
      answer: (
        <p>
          Yes. Once a draft is generated, you can choose to <strong>"Send Now"</strong> or <strong>"Schedule Send"</strong>. Scheduled emails will be queued and sent automatically at your chosen time, optimizing for your prospect's time zone.
        </p>
      )
    },
    {
      category: 'Follow-ups',
      question: "Does LeadQ.ai integrate with my email provider?",
      answer: (
        <p>
          We support integration with <strong>Gmail and Outlook</strong>. Once connected, emails sent from LeadQ.ai will appear in your "Sent" folder, ensuring you have a complete record of communication.
        </p>
      )
    },
    {
      category: 'Follow-ups',
      question: "Can I create multiple templates for different scenarios?",
      answer: (
        <p>
          Yes. You can save custom <strong>Prompt Templates</strong> (e.g., "Initial Outreach," "Proposal Follow-up," "Thank You"). When generating an email, simply select the template that best fits the meeting context.
        </p>
      )
    },

    // --- Security & Admin ---
    {
      category: 'Security & Admin',
      question: "Is my data secure? Can competitors access my leads?",
      answer: (
        <div className="space-y-2">
          <p>Your security is non-negotiable.</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>Private Tenant:</strong> All leads remain private to your organization.</li>
            <li><strong>No Shared Training:</strong> We never use your customer data to train shared or global AI models.</li>
            <li><strong>Encryption:</strong> Data is encrypted at rest and in transit.</li>
          </ul>
        </div>
      )
    },
    {
      category: 'Security & Admin',
      question: "What is the Corporate Dashboard used for?",
      answer: (
        <p>
          The Corporate Dashboard is for sales leaders. It enables visibility into <strong>team KPIs, follow-up speed, and license management</strong>. It also allows admins to define organization-wide service offerings for consistent messaging.
        </p>
      )
    },
    {
      category: 'Security & Admin',
      question: "Does LeadQ.ai integrate with existing CRMs?",
      answer: (
        <div className="space-y-2">
          <p><strong>Current:</strong> Export contacts via vCard and CSV.</p>
          <p><strong>Coming Soon:</strong> We are building native, one-click integrations for:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>HubSpot</li>
            <li>Salesforce</li>
            <li>Pipedrive</li>
          </ul>
        </div>
      )
    },
    {
      category: 'Security & Admin',
      question: "How do I manage team roles and permissions?",
      answer: (
        <p>
          Admins can assign roles such as <strong>"Member"</strong> (standard access) or <strong>"Admin"</strong> (full control). This creates a secure environment where team members can only access their own data, while managers can view team-wide performance.
        </p>
      )
    },
    {
      category: 'Security & Admin',
      question: "Is LeadQ.ai GDPR compliant?",
      answer: (
        <p>
          Yes. We adhere to <strong>GDPR and CCPA</strong> privacy standards. You have full control over your data, including the "Right to be Forgotten," allowing you to permanently delete prospect data from our systems at any time.
        </p>
      )
    }
  ];

  const faqCategories = ['General', 'Lead Capture', 'Research', 'Meetings', 'Follow-ups', 'Security & Admin'];

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

        {/* Contact Support Button (Action) */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all duration-200"
        >
          <FcComments size={18} />
          <span>Contact Support</span>
        </button>
      </div>

      {/* Dynamic Content */}
      <Card className="animate-fade-in min-h-[400px]">
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto py-2">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
              <p className="text-gray-500 mt-2">Everything you need to know about the product and billing.</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${faqCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-1 min-h-[300px]">
              {faqs
                .filter(faq => faq.category === faqCategory)
                .map((faq, index) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFaqIndex === index}
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  />
                ))}
              {faqs.filter(faq => faq.category === faqCategory).length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  No questions in this category yet.
                </div>
              )}
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
                <Button onClick={handleTicketSubmit} disabled={isSubmitting} className="w-full sm:w-auto flex items-center">
                  <span className="mr-2"><FcSent size={16} /></span> {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
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
                value={feedbackForm.topic}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, topic: e.target.value })}
              />
              <TextArea
                label="Your Thoughts"
                rows={6}
                placeholder="Tell us more..."
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              />

              <div className="flex justify-end pt-2">
                <Button onClick={handleFeedbackSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
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
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-white/30 flex items-center justify-center shadow-lg">
                    <FcCustomerSupport size={32} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-indigo-600 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">LeadQ Customer Support</h3>
                  <p className="text-blue-100 text-xs">Online • Average response: &lt; 1 min</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
              >
                <X size={20} className="text-red-600" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.source && msg.source !== 'System' && (
                      <p className="text-[10px] mt-1 opacity-60 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <FcIdea size={10} /> source: {msg.source}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Footer */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMsg.trim() || isTyping}
                  className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} className="text-white ml-1" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Connected to LeadQ Support System</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
