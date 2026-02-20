import React from 'react';
import { createRoot } from 'react-dom/client';
import SettingsPage from './SettingsPage';
import { ToastProvider } from '../../components/ToastContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <SettingsPage />
      </ToastProvider>
    </React.StrictMode>
  );
}
