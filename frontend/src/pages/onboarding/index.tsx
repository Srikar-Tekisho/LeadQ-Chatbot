import React from 'react';
import { createRoot } from 'react-dom/client';
import OnboardingPage from './OnboardingPage';
import { ToastProvider } from '../../components/ToastContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <OnboardingPage />
      </ToastProvider>
    </React.StrictMode>
  );
}
