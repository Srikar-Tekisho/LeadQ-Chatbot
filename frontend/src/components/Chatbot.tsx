import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useRef } from 'react';
import { FcCustomerSupport, FcFlashOn } from 'react-icons/fc';
import { Send, X, Minimize2, Mic, MicOff, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
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
        {
            id: '1',
            role: 'assistant',
            content: `${getTimeBasedGreeting()} I'm your AI assistant. How can I help you today?`,
            recommendations: ["What is the pricing?", "How does Lead Scoring work?", "Connect my CRM"]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Refs for speech recognition to access latest state in closures
    const inputValueRef = useRef(inputValue);
    const speechStartIndexRef = useRef(0);

    // Keep ref in sync with state
    useEffect(() => {
        inputValueRef.current = inputValue;
    }, [inputValue]);

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

            recognitionRef.current.onstart = () => {
                // When speech starts, mark the current position as the insertion point
                // If the user wants to append, we append to the end.
                // Note: We're assuming appending to the end for simplicity.
                speechStartIndexRef.current = inputValueRef.current.length;
            };

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Construct the new value: TextBeforeSpeech + (Final OR Interim)
                // We use the stored start index to ensure we replace the previous interim/final chunk
                // from the SAME speech session, rather than appending duplicate text.
                const prefix = inputValueRef.current.substring(0, speechStartIndexRef.current);
                const currentSpeech = finalTranscript || interimTranscript;

                if (currentSpeech) {
                    setInputValue(prefix + currentSpeech);
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

        const botMsgId = (Date.now() + 1).toString();
        let botMessageAdded = false;
        let accumulatedContent = "";

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

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // Keep the last partial line

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        if (data.type === "content") {
                            accumulatedContent += data.chunk;

                            if (!botMessageAdded) {
                                setIsTyping(false);
                                botMessageAdded = true;
                                setMessages(prev => [...prev, {
                                    id: botMsgId,
                                    role: 'assistant',
                                    content: accumulatedContent,
                                    recommendations: []
                                }]);
                            } else {
                                setMessages(prev => prev.map(msg =>
                                    msg.id === botMsgId ? { ...msg, content: accumulatedContent } : msg
                                ));
                            }
                        } else if (data.type === "recommendations") {
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMsgId ? { ...msg, recommendations: data.data } : msg
                            ));
                        } else if (data.type === "meta") {
                            if (data.sessionId) {
                                setSessionId(data.sessionId);
                                localStorage.setItem('chatSessionId', data.sessionId);
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk", e);
                    }
                }
            }

            // Handle edge case where stream finishes but no content was received (shouldn't happen with our backend)
            if (!botMessageAdded) {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: botMsgId,
                    role: 'assistant',
                    content: "I'm having trouble retrieving an answer right now."
                }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setIsTyping(false);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I can't connect to the server (port 5002). Please check if the backend is running and CORS is configured."
            };
            setMessages(prev => [...prev, errorMsg]);
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
            <style>{`
                .prose ul { list-style-type: disc; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose strong { font-weight: 600; color: #111827; }
                .prose p { margin-top: 0.5em; margin-bottom: 0.5em; }
            `}</style>
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
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm prose-indigo max-w-none text-gray-800">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="text-white">
                                                {msg.content}
                                            </div>
                                        )}
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(msg.content)}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Copy response"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-green-500 transition-colors"
                                                    title="Helpful"
                                                >
                                                    <ThumbsUp size={14} />
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Not helpful"
                                                >
                                                    <ThumbsDown size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleSend(messages[parseInt(msg.id) - 2]?.content)} // naive retry logic
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Regenerate response"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            </div>
                                        )}
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
                    <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full py-1.5 px-4 h-12 border border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all shadow-sm focus-within:shadow-md">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                                className={`flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none text-sm p-1 ml-1 placeholder-gray-400 ${isListening ? 'placeholder-indigo-600 font-medium' : ''}`}
                                disabled={isListening}
                                style={{ boxShadow: 'none' }} // Force remove any shadow/ring artifacts
                            />

                            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                                {isSpeechSupported && (
                                    <button
                                        onClick={toggleListening}
                                        className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center w-8 h-8 ${isListening
                                            ? 'bg-red-50 text-red-500 animate-pulse ring-1 ring-red-200'
                                            : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
                                            }`}
                                        title={isListening ? "Stop listening" : "Use voice input"}
                                    >
                                        {isListening ? <MicOff size={16} /> : <Mic size={18} />}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim()}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${inputValue.trim()
                                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white hover:shadow-indigo-200 hover:shadow-lg hover:scale-105 active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <Send size={16} className={inputValue.trim() ? 'ml-0.5' : ''} />
                                </button>
                            </div>
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
