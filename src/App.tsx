import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainDashboard from './components/MainDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import Chatbot from './components/Chatbot';
import Onboarding from './components/Onboarding';
import FeedbackPopup from './components/FeedbackPopup';

const ONBOARDING_COMPLETE_KEY = 'leadq_onboarding_complete';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const hasTriggeredExitIntent = useRef(false);

  // Check if user needs onboarding (using localStorage for non-auth flow)
  useEffect(() => {
    const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    setNeedsOnboarding(!onboardingComplete);
    setLoading(false);
  }, []);

  // Exit Intent Logic
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves top of viewport and hasn't triggered before
      if (e.clientY <= 0 && !hasTriggeredExitIntent.current && !needsOnboarding) {
        hasTriggeredExitIntent.current = true;
        setShowFeedback(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [needsOnboarding]);

  const handleExit = () => {
    setShowFeedback(false);
    hasTriggeredExitIntent.current = false;
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    setNeedsOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse">Loading LeadQ AI...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <BrowserRouter>
      {/* Global Feedback Popup - Triggered on Exit Intent */}
      {showFeedback && (
        <FeedbackPopup
          onClose={() => setShowFeedback(false)}
          onConfirmExit={handleExit}
        />
      )}

      {/* Global Chatbot Agent - Always Available */}
      <Chatbot />

      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route
          path="/settings"
          element={<SettingsDashboard onSignOut={() => setShowFeedback(true)} />}
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
