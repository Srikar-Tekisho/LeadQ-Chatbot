import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Check } from 'lucide-react';
import { Message } from '../hooks/useChat';

interface ChatMessageProps {
    msg: Message;
    onSend: (text?: string) => void;
    previousUserMessage?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg, onSend, previousUserMessage }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex flex-col w-full mb-2">
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
                    {msg.role === 'assistant' && msg.id !== '1' && (
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                            <button
                                onClick={handleCopy}
                                className={`transition-colors ${isCopied ? 'text-green-500' : 'text-gray-400 hover:text-indigo-600'}`}
                                title="Copy response"
                            >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            <button
                                onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                                className={`transition-colors ${feedback === 'like' ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                                title="Helpful"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                                className={`transition-colors ${feedback === 'dislike' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                title="Not helpful"
                            >
                                <ThumbsDown size={14} />
                            </button>
                            <button
                                onClick={() => previousUserMessage && onSend(previousUserMessage)}
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Regenerate response"
                                disabled={!previousUserMessage}
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
                            onClick={() => onSend(rec)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100 transition-colors shadow-sm text-left"
                        >
                            {rec}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
