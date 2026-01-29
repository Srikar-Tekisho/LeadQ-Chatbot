import React from 'react';
import chatbotIcon from '../assets/chatbot-icon-transparent.webm';

interface ChatTriggerProps {
    setIsOpen: (val: boolean) => void;
    floatingMessage?: string;
    isOpen: boolean;
}

export const ChatTrigger: React.FC<ChatTriggerProps> = ({ setIsOpen, floatingMessage, isOpen }) => {
    if (isOpen) return null;

    return (
        <div className="relative flex flex-col items-end">
            <div
                onClick={() => setIsOpen(true)}
                className="mb-3 mr-2 bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up border border-blue-500 max-w-[200px]"
            >
                <p className="text-sm font-semibold leading-snug flex items-start gap-2">
                    <span className="text-lg">👋</span>
                    <span>{floatingMessage}</span>
                </p>
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
    );
};
