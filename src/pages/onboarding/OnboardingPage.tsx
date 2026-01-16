import React, { useState } from 'react';
import Onboarding from '../../components/Onboarding';
import { ToastProvider } from '../../components/ToastContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const OnboardingPage: React.FC = () => {
  const [completed, setCompleted] = useState(false);
  const [showAgain, setShowAgain] = useState(true);

  const handleComplete = () => {
    setCompleted(true);
    setShowAgain(false);
    console.log('Onboarding completed!');
    console.log('Saved data:', localStorage.getItem('leadq_user_data'));
  };

  const handleReset = () => {
    localStorage.removeItem('leadq_user_data');
    localStorage.removeItem('leadq_onboarding_complete');
    setCompleted(false);
    setShowAgain(true);
    console.log('Onboarding reset - localStorage cleared');
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Test Controls Bar */}
          <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 z-50 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold">🚀 ONBOARDING MODULE</span>
              <span className="text-sm opacity-75">| Port 3001</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reset & Test Again
              </button>
              <a
                href="http://localhost:3002/dashboard.html"
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Dashboard :3002
              </a>
              <a
                href="http://localhost:3003/settings.html"
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Settings :3003
              </a>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-14">
            {showAgain ? (
              <Onboarding onComplete={handleComplete} />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Onboarding Complete!</h2>
                  <p className="text-gray-600 mb-6">
                    The onboarding flow finished successfully. Data saved to localStorage.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                    <p className="text-xs font-mono text-gray-500 mb-2">localStorage data:</p>
                    <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                      {JSON.stringify(JSON.parse(localStorage.getItem('leadq_user_data') || '{}'), null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleReset}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Reset & Test Again
                    </button>
                    <a
                      href="http://localhost:3002/dashboard.html"
                      className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      Continue to Dashboard →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default OnboardingPage;
