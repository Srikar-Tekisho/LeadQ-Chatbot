import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ToastContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import SettingsDashboard from '../../components/SettingsDashboard';
import Chatbot from '../../components/Chatbot';
import FeedbackPopup from '../../components/FeedbackPopup';
import { MessageSquare } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleBack = () => {
    window.location.href = 'http://localhost:3002/dashboard.html';
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  const handleConfirmExit = () => {
    setShowFeedback(false);
    window.location.href = 'http://localhost:3002/dashboard.html';
  };

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Test Controls Bar */}
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 z-50 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <span className="font-bold">⚙️ SETTINGS MODULE</span>
                <span className="text-sm opacity-75">| Includes Feedback & Chatbot</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFeedback(true)}
                  className="px-4 py-1.5 bg-white text-emerald-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  Leave Feedback
                </button>
                <a
                  href="http://localhost:3004/chatbot.html"
                  className="px-4 py-1.5 bg-white text-emerald-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Chatbot :3004
                </a>
              </div>
            </div>

            {/* Main Content with top padding for the control bar */}
            <div className="pt-12">
              <SettingsDashboard onBack={handleBack} />
            </div>

            {/* Chatbot - Always available */}
            <Chatbot />

            {/* Feedback Popup */}
            {showFeedback && (
              <FeedbackPopup
                onClose={handleFeedbackClose}
                onConfirmExit={handleConfirmExit}
              />
            )}
          </div>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default SettingsPage;
