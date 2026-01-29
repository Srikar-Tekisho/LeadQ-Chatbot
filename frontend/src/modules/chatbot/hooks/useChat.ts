import { useState, useEffect, useRef } from 'react';
import { chatService } from '../service-api';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: string[];
}

export const useChat = (initialOpen = false) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: getGreeting() + " I'm your AI assistant. How can I help you today?",
            recommendations: ["What is the pricing?", "How does Lead Scoring work?", "Connect my CRM"]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Floating messages
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const floatingMessages = [
        "Hi there! I'm Veda, your assistant ✨",
        "Need help navigating the dashboard? 🧭",
        "Have a question? Ask me anything! 💬",
        "I can help you analyze your leads! 🚀"
    ];

    useEffect(() => {
        if (isOpen) return;
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % floatingMessages.length);
        }, 15000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');
                if (event.results[0].isFinal) {
                    setInputValue(prev => prev + transcript);
                }
            };

            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onerror = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSend = async (text?: string) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: messageText }]);
        setInputValue("");
        setIsTyping(true);

        const botMsgId = (Date.now() + 1).toString();

        try {
            let accumulatedContent = "";
            let botMessageAdded = false;

            await chatService.sendMessage(messageText, sessionId, (data) => {
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
                } else if (data.type === "meta" && data.sessionId) {
                    setSessionId(data.sessionId);
                    localStorage.setItem('chatSessionId', data.sessionId);
                }
            });

            if (!botMessageAdded) {
                setIsTyping(false);
                setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: "I'm having trouble retrieving an answer right now." }]);
            }

        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm sorry, I can't connect to the server." }]);
        }
    };

    return {
        isOpen,
        setIsOpen,
        messages,
        inputValue,
        setInputValue,
        isTyping,
        isListening,
        toggleListening,
        handleSend,
        floatingMessage: floatingMessages[currentMessageIndex]
    };
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 👋";
    if (hour < 18) return "Good afternoon! 👋";
    return "Good evening! 👋";
}
