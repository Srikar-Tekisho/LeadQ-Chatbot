import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Chatbot from './components/Chatbot';
import './index.css';

const StandaloneChatbot = () => {
    // We want the chatbot to start open in standalone mode
    // However, Chatbot.tsx manages its own isOpen state.
    // For now, we'll just render it. The user can click the button.
    // Optimization: We could pass a prop to force it open.

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100">
            <div className="relative">
                <Chatbot initialOpen={true} />
            </div>
            <div className="absolute top-10 text-center">
                <h1 className="text-2xl font-bold text-gray-800">LeadQ AI Assistant</h1>
                <p className="text-gray-500">Standalone Mode (Port 3004)</p>
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<StandaloneChatbot />);
}
