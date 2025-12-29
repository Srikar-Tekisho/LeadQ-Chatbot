import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainDashboard from './components/MainDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import FeedbackPopup from './components/FeedbackPopup';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const hasTriggeredExitIntent = useRef(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Exit Intent Logic
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves top of viewport and hasn't triggered before
      if (e.clientY <= 0 && !hasTriggeredExitIntent.current && session) {
        hasTriggeredExitIntent.current = true;
        setShowFeedback(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowFeedback(false);
    hasTriggeredExitIntent.current = false; // Reset for next login
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 animate-pulse text-gray-400">Loading LeadQ AI...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      {/* Global Feedback Popup - Triggered on Logout OR Exit Intent */}
      {showFeedback && (
        <FeedbackPopup
          onClose={() => setShowFeedback(false)}
          onConfirmExit={handleLogout}
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
