import React, { useRef, useEffect } from 'react';
import { Send, Mic, Square, Loader2, X, AlertCircle } from 'lucide-react';
import type { VoiceState } from '../hooks/useVoiceInput';

interface ChatInputProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSend: (text?: string) => void;
    voiceState: VoiceState;
    isVoiceSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    voiceTranscript: string;
    voiceError: string | null;
    clearVoiceError: () => void;
    showPrivacyPolicy?: boolean;
    onDismissPrivacy?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    setInputValue,
    handleSend,
    voiceState,
    isVoiceSupported,
    startListening,
    stopListening,
    voiceTranscript,
    voiceError,
    clearVoiceError,
    showPrivacyPolicy = false,
    onDismissPrivacy
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isListening = voiceState === 'listening';
    const isProcessing = voiceState === 'processing';
    const isVoiceActive = isListening || isProcessing;

    // When voice is active, show transcript in real-time
    const displayValue = isVoiceActive ? voiceTranscript : inputValue;

    return (
        <div className="p-4 bg-white">
            {/* Voice error banner */}
            {voiceError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-2 text-xs text-red-600 animate-fade-in-up">
                    <AlertCircle size={14} className="shrink-0" />
                    <span className="flex-1">{voiceError}</span>
                    <button
                        onClick={clearVoiceError}
                        className="p-0.5 hover:bg-red-100 rounded-full transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            {showPrivacyPolicy && onDismissPrivacy && (
                <div className="flex justify-between items-center bg-transparent px-3 py-2 mb-2 text-xs text-gray-500 animate-fade-in-up">
                    <span>
                        By chatting, you agree to our <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">privacy policy</a>.
                    </span>
                    <button
                        onClick={onDismissPrivacy}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Active listening overlay bar */}
            {isListening && (
                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 mb-2 animate-fade-in-up">
                    {/* Animated waveform bars */}
                    <div className="voice-waveform flex items-center gap-[3px]">
                        <span className="voice-bar voice-bar-1" />
                        <span className="voice-bar voice-bar-2" />
                        <span className="voice-bar voice-bar-3" />
                        <span className="voice-bar voice-bar-4" />
                        <span className="voice-bar voice-bar-5" />
                    </div>
                    <span className="text-xs text-indigo-600 font-medium flex-1">Listening...</span>
                    {/* Stop button — clear and prominent */}
                    <button
                        type="button"
                        onClick={stopListening}
                        className="voice-stop-btn flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                        aria-label="Stop recording"
                    >
                        <Square size={12} fill="currentColor" />
                        Stop
                    </button>
                </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-2 animate-fade-in-up">
                    <Loader2 size={14} className="animate-spin text-amber-600" />
                    <span className="text-xs text-amber-700 font-medium">Processing your voice...</span>
                </div>
            )}

            <div className={`flex items-end gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border rounded-2xl transition-all duration-500 ease-out group ${
                isListening
                    ? 'border-indigo-300 shadow-[0_8px_30px_rgb(79,70,229,0.18)] ring-2 ring-indigo-100'
                    : isProcessing
                        ? 'border-amber-200 shadow-[0_8px_30px_rgb(245,158,11,0.12)] ring-1 ring-amber-50'
                        : inputValue.trim() || textareaRef.current === document.activeElement
                            ? 'border-indigo-200 shadow-[0_8px_30px_rgb(79,70,229,0.12)] ring-1 ring-indigo-50/50 translate-y-[-1px]'
                            : 'border-gray-100 shadow-sm hover:border-gray-200'
                } focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50/30`}>
                <textarea
                    ref={textareaRef}
                    value={displayValue}
                    onChange={(e) => {
                        if (!isVoiceActive) setInputValue(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    readOnly={isVoiceActive}
                    placeholder={isListening ? "Speak now..." : isProcessing ? "Processing..." : "Message..."}
                    className={`flex-1 w-full bg-transparent border-0 !border-none appearance-none !outline-none !ring-0 shadow-none !shadow-none resize-none py-2 text-sm text-gray-700 placeholder-gray-400 max-h-[56px] overflow-y-auto custom-scrollbar leading-relaxed ${
                        isListening ? 'text-indigo-700 placeholder-indigo-400' : isProcessing ? 'text-amber-700 placeholder-amber-400' : ''
                    }`}
                    style={{
                        minHeight: '32px',
                        outline: 'none',
                        border: 'none',
                        boxShadow: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                    }}
                />

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.1);
                    }
                `}</style>

                <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5 ml-1">
                    {/* Voice start button — only shown when idle and supported */}
                    {isVoiceSupported && voiceState === 'idle' && (
                        <button
                            type="button"
                            onClick={startListening}
                            className="voice-start-btn p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition-all duration-200 active:scale-95"
                            title="Start voice input"
                            aria-label="Start voice input"
                        >
                            <Mic size={18} />
                        </button>
                    )}

                    {/* Processing spinner in button area */}
                    {isProcessing && (
                        <div className="p-2 rounded-full bg-amber-50">
                            <Loader2 size={18} className="animate-spin text-amber-500" />
                        </div>
                    )}

                    {/* Send button */}
                    <button
                        type="button"
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isVoiceActive}
                        className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 ${
                            inputValue.trim() && !isVoiceActive
                                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-110 active:scale-95 translate-y-[2px]'
                                : 'bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed translate-y-[2px]'
                        }`}
                    >
                        <Send size={16} className={inputValue.trim() && !isVoiceActive ? "translate-x-[0.5px]" : ""} />
                    </button>
                </div>
            </div>
        </div>
    );
};
