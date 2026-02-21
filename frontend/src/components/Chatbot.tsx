import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { FcCustomerSupport, FcFlashOn } from 'react-icons/fc';
import { Send, X, Minimize2, Mic, MicOff, MoreHorizontal, MessageSquarePlus, XCircle, History, ChevronLeft, Clock, ThumbsUp, ThumbsDown, RotateCcw, Copy } from 'lucide-react';
import { Button } from './UIComponents';
import chatbotIconTransparent from '../assets/chatbot-icon-transparent.webm';
import chatbotIconOriginal from '../assets/chatbot-icon.webm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: string[];
    feedback?: 'like' | 'dislike' | null;
}

interface ChatbotProps {
    initialOpen?: boolean;
}

// Video Avatar Component with CSS-based background transparency
interface VideoAvatarProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    onClick?: () => void;
}

const VideoAvatar: React.FC<VideoAvatarProps> = ({ size = 'medium', className = '', onClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const sizeClasses = {
        small: 'w-10 h-10 scale-150',
        medium: 'w-24 h-24',
        large: 'w-32 h-32'
    };

    // Use the transparent version, with fallback handling
    // If transparent video has issues, use original with CSS blend
    const [useTransparent, setUseTransparent] = useState(true);

    const handleVideoError = () => {
        console.log("Transparent video failed, using original with CSS blend");
        setUseTransparent(false);
    };

    return (
        <div
            className={`relative ${className}`}
            onClick={onClick}
            style={{ isolation: 'isolate' }}
        >
            {useTransparent ? (
                // Transparent WebM version
                <video
                    ref={videoRef}
                    src={chatbotIconTransparent}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    onError={handleVideoError}
                    className={`${sizeClasses[size]} object-contain drop-shadow-xl`}
                    style={{
                        background: 'transparent',
                    }}
                />
            ) : (
                // Fallback: Original video with CSS blend mode for background removal
                <div className="relative" style={{ mixBlendMode: 'multiply' }}>
                    <video
                        ref={videoRef}
                        src={chatbotIconOriginal}
                        autoPlay
                        loop
                        muted
                        playsInline
                        disablePictureInPicture
                        disableRemotePlayback
                        controlsList="nodownload noplaybackrate noremoteplayback"
                        className={`${sizeClasses[size]} object-contain drop-shadow-xl`}
                        style={{
                            background: 'transparent',
                            filter: 'contrast(1.1) brightness(1.05)',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 👋";
    if (hour < 18) return "Good afternoon! 👋";
    return "Good evening! 👋";
};

const Chatbot: React.FC<ChatbotProps> = ({ initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `${getTimeBasedGreeting()} I'm your AI Support Assistant. How can I help you today?`,
            recommendations: ["What is LeadQ?", "Show me pricing", "How does it work?"]
        }
    ]);

    // Load history from local storage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('leadq_chat_history');
            if (saved) {
                setChatHistory(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const saveCurrentSession = () => {
        if (messages.length <= 1) return; // Don't save empty chats

        const preview = messages.find(m => m.role === 'user')?.content || "New Conversation";
        const sessionData = {
            id: sessionId,
            date: new Date().toISOString(),
            preview: preview.substring(0, 40) + (preview.length > 40 ? "..." : ""),
            messages: messages
        };

        const updatedHistory = [sessionData, ...chatHistory.filter(h => h.id !== sessionId)].slice(0, 10); // Keep last 10
        setChatHistory(updatedHistory);
        localStorage.setItem('leadq_chat_history', JSON.stringify(updatedHistory));
    };

    const handleNewChat = () => {
        saveCurrentSession();
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: `${getTimeBasedGreeting()} I'm your AI Support Assistant. How can I help you today?`,
                recommendations: ["What is LeadQ?", "Show me pricing", "How does it work?"]
            }
        ]);
        const newId = Date.now().toString();
        setSessionId(newId);
        localStorage.setItem('chatSessionId', newId);
        setIsMenuOpen(false);
        setShowHistory(false);
    };

    const handleEndChat = () => {
        saveCurrentSession();
        setIsOpen(false);
        setIsMenuOpen(false);
        setTimeout(() => {
            // Reset UI state but keep session until next open? 
            // Actually, usually end chat implies reset.
            handleNewChat();
        }, 300);
    };

    const handleViewHistory = () => {
        saveCurrentSession(); // Save current before switching view
        setShowHistory(true);
        setIsMenuOpen(false);
    };

    const restoreSession = (historyItem: any) => {
        // Save current *before* restoring old one? Maybe not needed if we just view history.
        // But user might lose current text. Optimistically save current first.
        saveCurrentSession();

        setMessages(historyItem.messages);
        setSessionId(historyItem.id);
        localStorage.setItem('chatSessionId', historyItem.id);
        setShowHistory(false);
    };
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const { addToast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<any>(null);
    const isListeningRef = useRef(false);
    const lastTranscriptRef = useRef("");
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
        isListeningRef.current = isListening;
    }, [isListening]);

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
            recognitionRef.current.continuous = true; // Stay active to allow for pauses
            recognitionRef.current.interimResults = true; // Show text as it's spoken
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.maxAlternatives = 1;

            const resetSilenceTimer = () => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    // Use ref to check current state without stale closure
                    if (recognitionRef.current && isListeningRef.current) {
                        console.log("Silence detected, automatically stopping microphone");
                        try {
                            recognitionRef.current.stop();
                        } catch (e) {
                            console.error("Error stopping recognition:", e);
                        }
                    }
                }, 5000); // 5 seconds of silence
            };

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                lastTranscriptRef.current = "";
                resetSilenceTimer();
            };

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i];
                    const transcript = result[0].transcript;
                    if (result.isFinal) {
                        // Accuracy Tuning: Lower threshold to 0.3 for "exact" capture. 
                        // High quality mics need less, but 0.3 allows for quiet/slurred words.
                        if (result[0].confidence >= 0.3) {
                            finalTranscript += (finalTranscript ? " " : "") + transcript.trim();
                        } else {
                            console.log("Low confidence final result ignored:", transcript, result[0].confidence);
                        }
                    } else {
                        interimTranscript += (interimTranscript ? " " : "") + transcript.trim();
                    }
                }

                const currentText = (finalTranscript || interimTranscript).trim();

                // Zero-Latency: Always reset silence timer if we got any text
                if (currentText.length > 0) {
                    resetSilenceTimer();
                    lastTranscriptRef.current = currentText;
                }

                const base = recognitionRef.current.baseText || "";

                if (finalTranscript) {
                    const newBase = base + (base ? " " : "") + finalTranscript;
                    recognitionRef.current.baseText = newBase;
                    setInputValue(newBase + (interimTranscript ? " " + interimTranscript : ""));
                } else {
                    setInputValue(base + (base && interimTranscript ? " " : "") + interimTranscript);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                lastTranscriptRef.current = "";
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                if (event.error === 'not-allowed') {
                    addToast("Microphone access blocked. Please enable it in browser settings.", "error");
                } else if (event.error === 'network') {
                    addToast("Network error occurred during speech recognition.", "error");
                } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    addToast(`Speech recognition error: ${event.error}`, "error");
                }
            };
        }

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [addToast]);

    const toggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                // Store current text as base
                recognitionRef.current.baseText = inputValue;
                recognitionRef.current.start();
                // State update happens in onstart
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };

    const handleSend = async (text?: string, skipUserMessage: boolean = false, regenerate: boolean = false) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        if (!skipUserMessage) {
            const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
            setMessages(prev => [...prev, userMsg]);
            setInputValue("");
        }

        setIsTyping(true);

        try {
            const response = await fetch('http://127.0.0.1:5002/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    sessionId: sessionId,
                    regenerate: regenerate
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

    const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m
        ));
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            addToast("Copied to clipboard!", "success");
        }).catch(err => {
            console.error("Copy failed:", err);
            addToast("Failed to copy", "error");
        });
    };

    const handleRegenerate = (msgId: string) => {
        const idx = messages.findIndex(m => m.id === msgId);
        if (idx > 0 && messages[idx - 1].role === 'user') {
            const previousUserMessage = messages[idx - 1].content;
            // Remove ONLY the current assistant message
            setMessages(prev => prev.filter(m => m.id !== msgId));
            // Regenerate with a flag to force new LLM variety
            handleSend(previousUserMessage, true, true);
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
                            <VideoAvatar size="small" />
                            <div>
                                <h3 className="font-bold text-sm">Veda Support</h3>
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Menu Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <MoreHorizontal size={20} />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <>
                                        {/* Backdrop to close */}
                                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>

                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-gray-700 z-20 animate-in fade-in zoom-in-95 duration-200">
                                            <button
                                                onClick={handleNewChat}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                            >
                                                <MessageSquarePlus size={16} className="text-indigo-600" />
                                                Start a new chat
                                            </button>
                                            <button
                                                onClick={handleEndChat}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-gray-500 hover:text-red-500"
                                            >
                                                <XCircle size={16} />
                                                End chat
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button
                                                onClick={handleViewHistory}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-gray-600"
                                            >
                                                <History size={16} />
                                                View recent chats
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* History View */}
                    {showHistory ? (
                        <div className="flex-1 flex flex-col bg-white">
                            {/* History Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ChevronLeft size={20} className="text-gray-600" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-gray-500" />
                                    <h3 className="font-semibold text-gray-800">Recent chats</h3>
                                </div>
                            </div>

                            {/* History List */}
                            <div className="flex-1 overflow-y-auto">
                                {chatHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                                        <History size={48} className="mb-4 opacity-50" />
                                        <p className="text-sm">No recent chats yet</p>
                                        <p className="text-xs mt-1">Start a conversation to see it here</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {chatHistory.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => restoreSession(item)}
                                                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800 text-sm truncate">
                                                            {item.preview || "New Chat"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {item.messages?.find((m: Message) => m.role === 'assistant')?.content?.substring(0, 50) || "Veda AI Agent:"}...
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                        {new Date(item.date).toLocaleDateString() === new Date().toLocaleDateString()
                                                            ? "Just now"
                                                            : new Date(item.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Start New Chat Button */}
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleNewChat}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-full font-medium text-sm transition-colors"
                                >
                                    <MessageSquarePlus size={18} />
                                    Start a new chat
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg, index) => (
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
                                                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-stone'}`}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="pl-1" {...props} />
                                                    }}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons for Assistant (Except Greeting) */}
                                        {msg.role === 'assistant' && index !== 0 && (
                                            <div className="flex items-center gap-1 ml-10 mt-1 opacity-70 hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleFeedback(msg.id, 'like')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${msg.feedback === 'like' ? 'text-green-500 bg-green-50' : 'text-gray-400'}`}
                                                    title="Love this answer"
                                                >
                                                    <ThumbsUp size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleFeedback(msg.id, 'dislike')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${msg.feedback === 'dislike' ? 'text-red-500 bg-red-50' : 'text-gray-400'}`}
                                                    title="Not helpful"
                                                >
                                                    <ThumbsDown size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerate(msg.id)}
                                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Regenerate answer"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(msg.content)}
                                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Copy answer"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        )}

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
                            <div className="p-4 bg-white">
                                {showPrivacyPolicy && (
                                    <div className="flex justify-between items-center bg-transparent px-3 py-2 mb-2 text-xs text-gray-500 animate-fade-in-up">
                                        <span>
                                            By chatting, you agree to our <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">privacy policy</a>.
                                        </span>
                                        <button
                                            onClick={() => setShowPrivacyPolicy(false)}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-100 focus-within:border-gray-200 focus-within:shadow-sm transition-all">
                                    <textarea
                                        ref={textareaRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        rows={1}
                                        placeholder={isListening ? "Listening..." : "Message..."}
                                        className={`flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm text-gray-600 placeholder-gray-400 max-h-32 overflow-hidden outline-none ${isListening ? 'animate-pulse placeholder-indigo-500' : ''}`}
                                        style={{ minHeight: '24px' }}
                                    />

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {isSpeechSupported && (
                                            <button
                                                onClick={toggleListening}
                                                className={`p-2 rounded-full transition-all ${isListening
                                                    ? 'bg-red-50 text-red-500 animate-pulse'
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                title={isListening ? "Stop listening" : "Use voice input"}
                                            >
                                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={!inputValue.trim()}
                                            className="p-2 bg-gray-200 text-gray-500 rounded-full hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-gray-500 transition-all"
                                        >
                                            <Send size={16} className={inputValue.trim() ? "ml-0.5" : ""} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center mt-2 opacity-0 h-0">
                                    {/* Hidden Footer to save space */}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )
            }

            {/* Toggle Button */}
            {/* Launcher / Toggle Button */}
            {!isOpen && (
                isMinimized ? (
                    /* Minimized State - Robot icon only (no bubble) */
                    <div className="relative flex flex-col items-end group">
                        {/* Expand Control - Visible on hover */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMinimized(false);
                            }}
                            className="absolute -top-2 -right-2 z-10 bg-white text-gray-500 hover:text-indigo-600 hover:bg-gray-50 p-1.5 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Expand chatbot"
                        >
                            <MessageSquarePlus size={16} />
                        </button>

                        <div
                            onClick={() => setIsOpen(true)}
                            className="cursor-pointer transition-transform duration-300 hover:scale-105 relative"
                            role="button"
                            tabIndex={0}
                            aria-label="Open chatbot"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') setIsOpen(true);
                            }}
                        >
                            <VideoAvatar size="medium" />
                        </div>
                    </div>
                ) : (
                    /* Maximized State - Full Avatar & Bubble */
                    <div className="relative flex flex-col items-end group">
                        {/* Minimize Control - Visible on hover or always */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMinimized(true);
                            }}
                            className="absolute -top-2 -right-2 z-10 bg-white text-gray-500 hover:text-indigo-600 hover:bg-gray-50 p-1.5 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Minimize chatbot"
                        >
                            <Minimize2 size={16} />
                        </button>

                        {/* Floating Message Bubble */}
                        <div
                            onClick={() => setIsOpen(true)}
                            className="mb-3 mr-2 bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up border border-blue-500 max-w-[200px] relative"
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
                            className="cursor-pointer transition-transform duration-300 hover:scale-105 relative"
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') setIsOpen(true);
                            }}
                        >
                            <VideoAvatar size="large" />
                        </div>
                    </div>
                )
            )}
        </div >
    );
};

export default Chatbot;
