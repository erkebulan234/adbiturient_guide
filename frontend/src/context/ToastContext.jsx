import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/ui';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ title, description, tone = 'success', duration = 3000 }) => {
    setToast({ title, description, tone });

    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200 }}>
          <Toast
            tone={toast.tone}
            title={toast.title}
            description={toast.description}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}