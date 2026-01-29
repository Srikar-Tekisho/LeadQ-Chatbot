import React from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ChatTrigger } from './components/ChatTrigger';
import { useChat } from './hooks/useChat';

export interface ChatbotProps {
    initialOpen?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialOpen = false }) => {
    const chatState = useChat(initialOpen);
    const { isOpen, setIsOpen, floatingMessage } = chatState;

    return (
        <div className= "fixed bottom-6 right-6 z-50 flex flex-col items-end" >
        <style>{`
                .prose ul { list-style-type: disc; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose strong { font-weight: 600; color: #111827; }
                .prose p { margin-top: 0.5em; margin-bottom: 0.5em; }
            `}</style>

{
    isOpen ? (
        <ChatWindow 
                    onClose= {() => setIsOpen(false)
}
chatState = { chatState }
    />
            ) : (
    <ChatTrigger 
                    setIsOpen= { setIsOpen }
floatingMessage = { floatingMessage }
isOpen = { isOpen }
    />
            )}
</div>
    );
};

export default Chatbot;
