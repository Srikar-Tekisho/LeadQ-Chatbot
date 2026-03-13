import React, { useEffect, useRef } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ChatTrigger } from './components/ChatTrigger';
import { useChat } from './hooks/useChat';
import { useDraggable } from './hooks/useDraggable';
import './chatbot-animations.css';


export interface ChatbotProps {
    initialOpen?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialOpen = false }) => {
    const chatState = useChat(initialOpen);

    // Chat window dimensions
    const CHAT_WIDTH = 400;
    const CHAT_HEIGHT = 500;
    const BOT_SIZE = 128;
    const MINIMIZED_SIZE = 68;
    const TRIGGER_WIDTH = 220;  // bubble is max-w-[200px] + padding/margin
    const TRIGGER_HEIGHT = 220; // bubble (~80px) + avatar (128px) + gap
    const EDGE_MARGIN = 20;     // consistent margin from screen edges

    // Default position: bottom-right, accounting for full trigger dimensions
    const getDefaultPosition = () => ({
        x: window.innerWidth - TRIGGER_WIDTH - EDGE_MARGIN,
        y: window.innerHeight - TRIGGER_HEIGHT - EDGE_MARGIN
    });

    // Always start at the default bottom-right position on page load/refresh.
    // Also clear any stale localStorage entry from the old version.
    localStorage.removeItem('leadq_chatbot_position');
    const initialPos = getDefaultPosition();

    // Determine current element dimensions based on state
    const currentWidth = chatState.isOpen ? CHAT_WIDTH : (chatState.isMinimized ? MINIMIZED_SIZE : TRIGGER_WIDTH);
    const currentHeight = chatState.isOpen ? CHAT_HEIGHT : (chatState.isMinimized ? MINIMIZED_SIZE : TRIGGER_HEIGHT);

    const { position, setPosition, onMouseDown, onTouchStart, hasMoved, isMinimizedByDrag, isDragging, resetIsMinimized, clampToViewport } = useDraggable({
        initialPosition: initialPos,
        elementWidth: currentWidth,
        elementHeight: currentHeight,
        onSmartMinimize: (minByDrag) => {
            chatState.setIsMinimized(true);
            if (chatState.isOpen) chatState.setIsOpen(false);
        },
        onDragEnd: (_pos) => {
            // No longer persist to localStorage — position resets on every page reload
        }
    });

    // Keep the bottom-right corner anchored when switching states
    // (open ↔ trigger ↔ minimized) so the chatbot never jumps around.
    const prevDimsRef = useRef({ w: currentWidth, h: currentHeight });

    useEffect(() => {
        // During an active drag the drag handler owns the position
        if (isDragging) {
            prevDimsRef.current = { w: currentWidth, h: currentHeight };
            return;
        }

        const prevW = prevDimsRef.current.w;
        const prevH = prevDimsRef.current.h;
        prevDimsRef.current = { w: currentWidth, h: currentHeight };

        if (prevW === currentWidth && prevH === currentHeight) return;

        // Shift position so the bottom-right corner stays visually fixed
        const dx = prevW - currentWidth;
        const dy = prevH - currentHeight;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let newX = position.x + dx;
        let newY = position.y + dy;

        // Clamp to viewport
        newX = Math.max(EDGE_MARGIN, Math.min(newX, vw - currentWidth - EDGE_MARGIN));
        newY = Math.max(EDGE_MARGIN, Math.min(newY, vh - currentHeight - EDGE_MARGIN));

        setPosition({ x: newX, y: newY });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatState.isOpen, chatState.isMinimized, isDragging]);

    // Reset to bottom-right default on window resize for responsiveness
    useEffect(() => {
        const handleResize = () => {
            setPosition(getDefaultPosition());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 50,
                cursor: chatState.isOpen ? 'default' : 'pointer',
                touchAction: 'none',
                width: chatState.isOpen ? `${CHAT_WIDTH}px` : 'auto',
                height: chatState.isOpen ? `${CHAT_HEIGHT}px` : 'auto',
                maxHeight: chatState.isOpen ? 'calc(100vh - 40px)' : 'auto',
                transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            className="flex flex-col items-end"
        >
            <style>{`
                .prose ul { list-style-type: disc; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose strong { font-weight: 600; color: #111827; }
                .prose p { margin-top: 0.5em; margin-bottom: 0.5em; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
            `}</style>

            {chatState.isOpen ? (
                <ChatWindow
                    onClose={() => {
                        chatState.setIsOpen(false);
                        resetIsMinimized();
                    }}
                    chatState={chatState}
                    onMouseDown={onMouseDown}
                />
            ) : (
                <ChatTrigger
                    setIsOpen={(val) => {
                        if (!hasMoved) {
                            chatState.setIsOpen(val);
                            resetIsMinimized();
                        }
                    }}
                    floatingMessage={chatState.floatingMessage}
                    isOpen={chatState.isOpen}
                    isMinimized={chatState.isMinimized}
                    setIsMinimized={(val) => {
                        chatState.setIsMinimized(val);
                        if (!val) resetIsMinimized();
                    }}
                    onMouseDown={onMouseDown}
                    isMinimizedByDrag={isMinimizedByDrag}
                    isDragging={isDragging}
                />
            )}
        </div>
    );
};

export default Chatbot;
