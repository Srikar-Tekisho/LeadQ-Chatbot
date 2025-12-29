import React, { useState, useEffect, useRef } from 'react';
import { FcCustomerSupport, FcFlashOn } from 'react-icons/fc';
import { Send, X, Minimize2, MessageSquare } from 'lucide-react';
import { Button } from './UIComponents';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

// --- Knowledge Base for RAG ---
const FAQ_DATA = [
    { keywords: ['leadq', 'what is', 'platform'], answer: "LeadQ.ai is an AI-native sales intelligence platform designed to automate the manual 'shadow work' of sales. It handles business card scanning, prospect research, meeting notes, and follow-up emails." },
    { keywords: ['crm', 'difference'], answer: "A CRM records history (system of record), while LeadQ.ai drives action (system of action). We focus on high-friction moments like trade shows and discovery calls." },
    { keywords: ['mobile', 'phone', 'app'], answer: "Yes, LeadQ.ai is optimized for mobile web. A dedicated iOS/Android app is on our roadmap." },
    { keywords: ['free', 'trial', 'pricing'], answer: "We offer a 14-day free trial with full access to Pro features. No credit card required." },
    { keywords: ['scan', 'card', 'business card', 'ocr'], answer: "You can scan unlimited business cards. We support multi-image capture and handwritten notes using advanced OCR." },
    { keywords: ['research', 'agent', 'data'], answer: "Our Research Agent searches public sources (LinkedIn, websites, news) to generate a lead briefing in 30-60 seconds." },
    { keywords: ['meeting', 'record', 'transcript'], answer: "We support both in-person (mobile mic) and virtual (Meet/Teams) meeting recordings with automated transcription and summaries." },
    { keywords: ['language', 'support'], answer: "Currently, we support English, Spanish, French, and German." },
    { keywords: ['security', 'privacy', 'gdpr'], answer: "Your data is secure. We use private tenants, do not train shared models on your data, and are GDPR/CCPA compliant." },
    { keywords: ['integration', 'hubspot', 'salesforce'], answer: "We currently support vCard/CSV export. Native integrations for HubSpot, Salesforce, and Pipedrive are coming soon." },
    { keywords: ['password', 'reset', 'login'], answer: "To reset your password, go to the Security Settings page and click 'Update Password'." },
    { keywords: ['contact', 'support', 'help'], answer: "You can contact human support by emailing support@leadq.ai or raising a ticket in the Help section." }
];

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Hi there! 👋 I'm your AI assistant. How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI Response (Local RAG)
        setTimeout(() => {
            const lowerInput = inputValue.toLowerCase();
            let botResponse = "";

            // 1. Search Knowledge Base
            const match = FAQ_DATA.find(item => item.keywords.some(k => lowerInput.includes(k)));

            if (match) {
                botResponse = match.answer;
            } else {
                // 2. Fallback Logic
                // Check if query is remotely related to the domain (Sales, Tech, Business, Account)
                const isRelevantCtxt = ['lead', 'sales', 'account', 'bill', 'meeting', 'email', 'feature', 'bug', 'error', 'login', 'signup', 'data'].some(k => lowerInput.includes(k));

                if (isRelevantCtxt) {
                    botResponse = "I don't have the specific details on that right now, but as a LeadQ AI, I can help you with features, pricing, security, or lead capture. Could you rephrase your question?";
                } else {
                    botResponse = "I apologize, but I can only assist with questions related to the LeadQ.ai platform. I cannot help with general topics like weather or general knowledge.";
                }
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: botResponse
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <FcCustomerSupport size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">LeadQ Support</h3>
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <Minimize2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm text-lg">
                                        🤖
                                    </div>
                                )}
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1 ml-10">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="relative flex items-center">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask for help..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                <FcFlashOn size={10} /> Powered by LeadQ AI
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${isOpen
                    ? 'bg-gray-800 text-white rotate-90'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={26} strokeWidth={2.5} />}

                {/* Notification Badge (Fake) */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>
        </div>
    );
};

export default Chatbot;
