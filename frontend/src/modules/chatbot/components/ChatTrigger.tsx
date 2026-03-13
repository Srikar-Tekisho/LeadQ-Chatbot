import React, { useRef, useState } from 'react';
import { Minimize2, MessageSquarePlus } from 'lucide-react';
import chatbotIcon from '../assets/chatbot-icon-transparent.webm';
import chatbotIconOriginal from '../assets/chatbot-icon-transparent.webm';
import chatbotMascot from '../assets/chatbot-mascot.png';

interface ChatTriggerProps {
    setIsOpen: (val: boolean) => void;
    floatingMessage?: string;
    isOpen: boolean;
    isMinimized: boolean;
    setIsMinimized: (val: boolean) => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    isMinimizedByDrag?: boolean;
    isDragging?: boolean;
}

export const ChatTrigger: React.FC<ChatTriggerProps> = ({
    setIsOpen,
    floatingMessage,
    isOpen,
    isMinimized,
    setIsMinimized,
    onMouseDown,
    isMinimizedByDrag,
    isDragging
}) => {
    const avatarVideoRef = useRef<HTMLVideoElement>(null);
    const [expandAnimKey, setExpandAnimKey] = useState(0);
    const [isContractingOut, setIsContractingOut] = useState(false);

    if (isOpen) return null;

    const handleToggleOpen = () => {
        if (isMinimized || isMinimizedByDrag) {
            // Reset video to beginning so "hi" animation plays fresh
            if (avatarVideoRef.current) {
                avatarVideoRef.current.currentTime = 0;
                avatarVideoRef.current.play().catch(() => { });
            }
            // Go directly to full state — no intermediate step
            setIsMinimized(false);
            // Trigger expand animation on the default state
            setExpandAnimKey(prev => prev + 1);
        } else {
            setIsOpen(true);
        }
    };

    const handleMinimize = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        // Play contract animation, then switch to minimized
        setIsContractingOut(true);
        setTimeout(() => {
            setIsContractingOut(false);
            setIsMinimized(true);
        }, 350);
    };

    // Minimized State - Mascot Circular Icon with gradient ring
    if ((isMinimized || isMinimizedByDrag) && !isContractingOut) {
        return (
            <div
                className="relative group"
                onMouseDown={onMouseDown}
            >
                {/* Expand Control - Visible on hover */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleOpen();
                    }}
                    className="absolute -top-2 -right-2 z-10 bg-white text-gray-500 hover:text-indigo-600 hover:bg-gray-50 p-1.5 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Expand chatbot"
                >
                    <MessageSquarePlus size={16} />
                </button>

                <div
                    onClick={handleToggleOpen}
                    className="chatbot-circle-ring chatbot-circle-idle"
                    style={{ width: 68, height: 68, cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label="Open chatbot"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleToggleOpen();
                    }}
                >
                    <div className="chatbot-circle-ring-inner" style={{ width: '100%', height: '100%' }}>
                        <img
                            src={chatbotMascot}
                            alt="Chatbot mascot"
                            className="w-[85%] h-[85%] object-contain"
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Default State — Video avatar + floating message bubble
    return (
        <div
            key={expandAnimKey}
            className={`relative flex flex-col items-end group ${expandAnimKey > 0 ? 'chatbot-expand-enter' : ''
                } ${isContractingOut ? 'chatbot-contract-exit' : ''}`}
            onMouseDown={onMouseDown}
        >
            {/* Minimize Control - Visible on hover */}
            <button
                onClick={handleMinimize}
                className="absolute -top-2 -right-2 z-10 bg-white text-gray-500 hover:text-indigo-600 hover:bg-gray-50 p-1.5 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Minimize chatbot"
            >
                <Minimize2 size={16} />
            </button>

            {/* Floating Message Bubble */}
            <div
                onClick={() => setIsOpen(true)}
                className={`mb-3 mr-2 bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-br-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up border border-blue-500 max-w-[200px] relative ${isDragging ? 'opacity-0 pointer-events-none' : ''}`}
                draggable={false}
            >
                <p className="text-sm font-semibold leading-snug flex items-start gap-2 select-none">
                    <span className="text-lg">👋</span>
                    <span>{floatingMessage}</span>
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
                <video
                    ref={avatarVideoRef}
                    src={chatbotIcon}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    //@ts-ignore
                    disableRemotePlayback
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    className="w-32 h-32 object-contain drop-shadow-xl"
                    style={{ background: 'transparent' }}
                />
            </div>
        </div>
    );
};
