import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AccessGate } from '@shared/auth';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AccessGate secret={import.meta.env.VITE_GAME_API_SECRET}>
      <App />
    </AccessGate>
  </React.StrictMode>
);
