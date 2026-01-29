import React from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSend: (text?: string) => void;
    isListening: boolean;
    toggleListening: () => void;
    isSpeechSupported?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    setInputValue,
    handleSend,
    isListening,
    toggleListening,
    isSpeechSupported = true // Defaulting to true as checked in hook or we can create a util
}) => {

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full py-1.5 px-4 h-12 border border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all shadow-sm focus-within:shadow-md">
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    className={`flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none text-sm p-1 ml-1 placeholder-gray-400 ${isListening ? 'placeholder-indigo-600 font-medium' : ''}`}
                    disabled={isListening}
                    style={{ boxShadow: 'none' }}
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
    );
};
