import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx'; // 1. Import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* 2. Wrap the App */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);