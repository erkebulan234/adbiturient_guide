import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { CompareProvider } from './context/CompareContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <CompareProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </CompareProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);