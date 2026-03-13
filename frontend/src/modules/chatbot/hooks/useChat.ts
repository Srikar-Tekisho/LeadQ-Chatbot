import { useState, useEffect, useRef } from 'react';
import { chatService } from '../service-api';
import { useVoiceInput } from './useVoiceInput';
import type { VoiceState } from './useVoiceInput';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    recommendations?: string[];
    feedback?: 'like' | 'dislike' | null;
}

export interface ChatHistoryItem {
    id: string;
    date: string;
    preview: string;
    messages: Message[];
}

export const useChat = (initialOpen = false) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(true);
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: getGreeting() + " I'm your AI Support Assistant. How can I help you today?",
            recommendations: ["How can LeadQ help my business?", "Show me the pricing plans?", "How does AI lead scoring work?"]
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chatSessionId'));
    // Voice input — new dedicated hook with clean state machine
    const voice = useVoiceInput(
        (text: string) => setInputValue(text),
        inputValue
    );

    // Floating messages
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const floatingMessages = [
        "Hi there! I'm Veda, your assistant ✨",
        "Need help navigating the dashboard? 🧭",
        "Have a question? Ask me anything! 💬",
        "I can help you analyze your leads! 🚀"
    ];

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

        const preview = messages.find((m: Message) => m.role === 'user')?.content || "New Conversation";
        const sessionData: ChatHistoryItem = {
            id: sessionId || Date.now().toString(),
            date: new Date().toISOString(),
            preview: preview.substring(0, 40) + (preview.length > 40 ? "..." : ""),
            messages: messages
        };

        const updatedHistory = [sessionData, ...chatHistory.filter((h: ChatHistoryItem) => h.id !== sessionId)].slice(0, 10); // Keep last 10
        setChatHistory(updatedHistory);
        localStorage.setItem('leadq_chat_history', JSON.stringify(updatedHistory));
    };

    const handleNewChat = () => {
        saveCurrentSession();
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: getGreeting() + " I'm your AI Support Assistant. How can I help you today?",
                recommendations: ["How can LeadQ help my business?", "Show me the pricing plans?", "How does AI lead scoring work?"]
            }
        ]);
        const newId = Date.now().toString();
        setSessionId(newId);
        localStorage.setItem('chatSessionId', newId);
        setShowHistory(false);
    };

    const handleEndChat = () => {
        saveCurrentSession();
        setIsOpen(false);
        setTimeout(() => {
            handleNewChat();
        }, 300);
    };

    const handleViewHistory = () => {
        saveCurrentSession();
        setShowHistory(true);
    };

    const restoreSession = (historyItem: ChatHistoryItem) => {
        saveCurrentSession();
        setMessages(historyItem.messages);
        setSessionId(historyItem.id);
        localStorage.setItem('chatSessionId', historyItem.id);
        setShowHistory(false);
    };

    useEffect(() => {
        if (isOpen) return;
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev: number) => (prev + 1) % floatingMessages.length);
        }, 15000);
        return () => clearInterval(interval);
    }, [isOpen]);



    const handleSend = async (text?: string, regenerate?: boolean, skipUserMessage?: boolean) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        if (!skipUserMessage) {
            const userMsgId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: messageText }]);
        }

        setInputValue("");
        setIsTyping(true);

        const botMsgId = regenerate
            ? messages[messages.length - 1]?.id
            : `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            let accumulatedContent = "";
            let botMessageAdded = false;

            // Prepare history for backend (last 5 messages)
            const chatHistoryPayload = messages.slice(-5).map((m: Message) => ({
                role: m.role,
                content: m.content
            }));

            await chatService.sendMessage(messageText, sessionId, (data) => {
                if (data.type === "content") {
                    accumulatedContent += data.chunk;
                    if (!botMessageAdded && !regenerate) {
                        setIsTyping(false);
                        botMessageAdded = true;
                        setMessages((prev: Message[]) => [...prev, {
                            id: botMsgId,
                            role: 'assistant',
                            content: accumulatedContent,
                            recommendations: []
                        }]);
                    } else {
                        setIsTyping(false);
                        setMessages((prev: Message[]) => prev.map((msg: Message) =>
                            msg.id === botMsgId ? { ...msg, content: accumulatedContent } : msg
                        ));
                    }
                } else if (data.type === "recommendations") {
                    setMessages((prev: Message[]) => prev.map((msg: Message) =>
                        msg.id === botMsgId ? { ...msg, recommendations: data.data } : msg
                    ));
                } else if (data.type === "meta" && data.sessionId) {
                    setSessionId(data.sessionId);
                    localStorage.setItem('chatSessionId', data.sessionId);
                }
            }, regenerate, chatHistoryPayload);

            if (!botMessageAdded && !regenerate) {
                setIsTyping(false);
                setMessages((prev: Message[]) => [...prev, { id: botMsgId, role: 'assistant', content: "I'm having trouble retrieving an answer right now." }]);
            }

        } catch (error) {
            console.error(error);
            setIsTyping(false);
            if (!regenerate) {
                const errorMsgId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                setMessages((prev: Message[]) => [...prev, { id: errorMsgId, role: 'assistant', content: "I'm sorry, I can't connect to the server." }]);
            }
        }
    };

    const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m
        ));
    };

    return {
        isOpen,
        setIsOpen,
        isMinimized,
        setIsMinimized,
        messages,
        inputValue,
        setInputValue,
        isTyping,
        voiceState: voice.voiceState,
        isVoiceSupported: voice.isSupported,
        startListening: voice.startListening,
        stopListening: voice.stopListening,
        voiceTranscript: voice.transcript,
        voiceError: voice.error,
        clearVoiceError: voice.clearError,
        handleSend,
        handleNewChat,
        handleEndChat,
        handleViewHistory,
        handleFeedback,
        chatHistory,
        restoreSession,
        showHistory,
        setShowHistory,
        showPrivacyPolicy,
        setShowPrivacyPolicy,
        floatingMessage: floatingMessages[currentMessageIndex]
    };
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 👋";
    if (hour < 18) return "Good afternoon! 👋";
    return "Good evening! 👋";
}
