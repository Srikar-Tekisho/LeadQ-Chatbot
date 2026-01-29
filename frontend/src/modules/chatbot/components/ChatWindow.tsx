import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import chatbotIcon from '../assets/chatbot-icon-transparent.webm';

interface ChatWindowProps {
    onClose: () => void;
    chatState: ReturnType<typeof useChat>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, chatState }) => {
    const { messages, isTyping, inputValue, setInputValue, isListening, toggleListening, handleSend } = chatState;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
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
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                    <ChatMessage
                        key={msg.id}
                        msg={msg}
                        onSend={handleSend}
                        previousUserMessage={messages[index - 1]?.role === 'user' ? messages[index - 1].content : undefined}
                    />
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
            <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSend={handleSend}
                isListening={isListening}
                toggleListening={toggleListening}
                isSpeechSupported={true}
            />
        </div>
    );
};
