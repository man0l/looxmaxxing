import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Toast, type ToastData, type ToastVariant } from '../components/Toast';

interface ToastValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = 'error') => {
    idRef.current += 1;
    setToast({ id: idRef.current, message, variant });
  }, []);

  const handleClose = useCallback(() => setToast(null), []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={handleClose} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
