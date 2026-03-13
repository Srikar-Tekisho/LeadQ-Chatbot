import React, { useEffect, useRef, useState } from 'react';
import { X, MoreHorizontal, MessageSquarePlus, XCircle, History, ChevronLeft, Clock } from 'lucide-react';
import { Message } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import chatbotIcon from '../assets/chatbot-icon-transparent.webm';

interface ChatWindowProps {
    onClose: () => void;
    chatState: ReturnType<typeof useChat>;
    onMouseDown?: (e: React.MouseEvent) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, chatState, onMouseDown }) => {
    const {
        messages,
        isTyping,
        inputValue,
        setInputValue,
        voiceState,
        isVoiceSupported,
        startListening,
        stopListening,
        voiceTranscript,
        voiceError,
        clearVoiceError,
        handleSend,
        handleNewChat,
        handleEndChat,
        handleViewHistory,
        chatHistory,
        restoreSession,
        showHistory,
        setShowHistory,
        showPrivacyPolicy,
        setShowPrivacyPolicy
    } = chatState;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, chatState.isOpen]);

    const onNewChat = () => {
        handleNewChat();
        setIsMenuOpen(false);
    };

    const onEndChat = () => {
        handleEndChat();
        setIsMenuOpen(false);
        onClose();
    };

    const onViewHistory = () => {
        handleViewHistory();
        setIsMenuOpen(false);
    };

    return (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
            {/* Header */}
            <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shadow-md cursor-grab active:cursor-grabbing select-none"
                onMouseDown={onMouseDown}
            >
                <div className="flex items-center gap-3">
                    <video
                        src={chatbotIcon}
                        autoPlay
                        loop
                        muted
                        playsInline
                        disablePictureInPicture
                        //@ts-ignore
                        disableRemotePlayback
                        controlsList="nodownload noplaybackrate noremoteplayback"
                        className="w-10 h-10 object-contain drop-shadow-sm scale-150 bg-transparent"
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
                    {/* Menu Button */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
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
                                        onClick={onNewChat}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    >
                                        <MessageSquarePlus size={16} className="text-indigo-600" />
                                        Start a new chat
                                    </button>
                                    <button
                                        onClick={onEndChat}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-gray-500 hover:text-red-500"
                                    >
                                        <XCircle size={16} />
                                        End chat
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button
                                        onClick={onViewHistory}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-gray-600"
                                    >
                                        <History size={16} />
                                        View recent chats
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* History View */}
            {showHistory ? (
                <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
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

                    {/* History List — scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">
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
                            onClick={onNewChat}
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
                        voiceState={voiceState}
                        isVoiceSupported={isVoiceSupported}
                        startListening={startListening}
                        stopListening={stopListening}
                        voiceTranscript={voiceTranscript}
                        voiceError={voiceError}
                        clearVoiceError={clearVoiceError}
                        showPrivacyPolicy={showPrivacyPolicy}
                        onDismissPrivacy={() => setShowPrivacyPolicy(false)}
                    />
                </>
            )}
        </div>
    );
};
