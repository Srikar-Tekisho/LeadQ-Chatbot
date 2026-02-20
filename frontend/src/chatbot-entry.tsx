import React from 'react';
import { createRoot } from 'react-dom/client';
import Chatbot from './components/Chatbot';
import { ToastProvider } from './components/ToastContext';
import './index.css';

const StandaloneChatbot = () => {
    return (
        <ToastProvider>
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="relative">
                    <Chatbot initialOpen={true} />
                </div>
                <div className="absolute top-10 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">LeadQ AI Assistant</h1>
                    <p className="text-gray-500">Standalone Mode (Port 3004)</p>
                </div>
            </div>
        </ToastProvider>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<StandaloneChatbot />);
}
