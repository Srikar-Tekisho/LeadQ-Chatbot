import React, { useState, useEffect, useRef } from 'react';
import { FcCustomerSupport, FcFlashOn } from 'react-icons/fc';
import { Send, X, Minimize2, Mic, MicOff } from 'lucide-react';
import { Button } from './UIComponents';
import chatbotIcon from '../assets/chatbot-icon-transparent.webm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: string[];
}

interface ChatbotProps {
    initialOpen?: boolean;
}

const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 👋";
    if (hour < 18) return "Good afternoon! 👋";
    return "Good evening! 👋";
};

const Chatbot: React.FC<ChatbotProps> = ({ initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: `${getTimeBasedGreeting()} I'm your AI assistant. How can I help you today?` }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Floating interaction messages
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const floatingMessages = [
        "Hi there! I'm Veda, your assistant ✨",
        "Need help navigating the dashboard? 🧭",
        "Have a question? Ask me anything! 💬",
        "I can help you analyze your leads! 🚀"
    ];

    useEffect(() => {
        if (isOpen) return; // Don't rotate if open
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % floatingMessages.length);
        }, 15000); // Change every 15 seconds
        return () => clearInterval(interval);
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSpeechSupported(true);
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setInputValue(prev => prev + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // Optional: You could show interim results ghosted in the UI
                if (interimTranscript) {
                    setInputValue(interimTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setInputValue(""); // Clear input when starting fresh listener
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };

    const handleSend = async (text?: string) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            const response = await fetch('http://127.0.0.1:5002/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    sessionId: sessionId
                }),
            });

            const data = await response.json();

            if (data.sessionId) {
                setSessionId(data.sessionId);
                localStorage.setItem('chatSessionId', data.sessionId);
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || "I'm having trouble connecting right now. Please try again later.",
                recommendations: data.recommendations || []
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I can't connect to the server (port 5002). Please check if the backend is running and CORS is configured."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
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
                            <video
                                src={chatbotIcon}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-10 h-10 object-contain drop-shadow-sm scale-150"
                                style={{ background: 'transparent' }}
                            />
                            <div>
                                <h3 className="font-bold text-sm">Veda Support</h3>
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col w-full mb-2">
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                                {/* Recommendations Chips */}
                                {msg.role === 'assistant' && msg.recommendations && msg.recommendations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 ml-10 mt-1 animate-fade-in-up">
                                        {msg.recommendations.map((rec, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(rec)}
                                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 transition-colors shadow-sm text-left"
                                            >
                                                {rec}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                        <div className="flex items-end gap-2 bg-gray-100 rounded-xl p-2 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all shadow-inner">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                rows={1}
                                placeholder={isListening ? "Listening..." : "Ask for help..."}
                                className={`w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-sm max-h-32 overflow-y-auto ${isListening ? 'placeholder-indigo-500 animate-pulse' : ''}`}
                                style={{ minHeight: '40px' }}
                            />

                            <div className="flex items-center gap-1 pb-1 flex-shrink-0">
                                {isSpeechSupported && (
                                    <button
                                        onClick={toggleListening}
                                        className={`p-2 rounded-lg transition-all ${isListening
                                            ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-200'
                                            : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-200'
                                            }`}
                                        title={isListening ? "Stop listening" : "Use voice input"}
                                    >
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>
                                )}
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                <FcFlashOn size={10} /> Powered by LeadQ AI
                            </span>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Toggle Button */}
            {/* Launcher / Toggle Button */}
            {
                !isOpen && (
                    <div className="relative flex flex-col items-end">
                        {/* Floating Message Bubble */}
                        {/* Floating Message Bubble */}
                        {/* Floating Message Cloud */}
                        <div
                            onClick={() => setIsOpen(true)}
                            className="mb-3 mr-2 bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up border border-blue-500 max-w-[200px]"
                        >
                            <p className="text-sm font-semibold leading-snug flex items-start gap-2">
                                <span className="text-lg">👋</span>
                                <span>{floatingMessages[currentMessageIndex]}</span>
                            </p>
                            {/* CSS Triangle Tail */}
                            <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-blue-600 border-r-[10px] border-r-transparent filter drop-shadow-sm"></div>
                        </div>

                        <div
                            onClick={() => setIsOpen(true)}
                            className="cursor-pointer transition-transform duration-300 hover:scale-105"
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') setIsOpen(true);
                            }}
                        >
                            <video
                                src={chatbotIcon}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-32 h-32 object-contain drop-shadow-xl"
                                style={{ background: 'transparent' }}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Chatbot;
