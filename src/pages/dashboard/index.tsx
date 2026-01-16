import React from 'react';
import { createRoot } from 'react-dom/client';
import DashboardPage from './DashboardPage';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <DashboardPage />
    </React.StrictMode>
  );
}
