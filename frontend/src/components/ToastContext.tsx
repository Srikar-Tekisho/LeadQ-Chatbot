
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FcCheckmark, FcHighPriority, FcInfo } from 'react-icons/fc';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000); // Auto dismiss after 5 seconds
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`flex items-center p-4 rounded-lg shadow-lg border border-opacity-10 min-w-[300px] animate-fade-in bg-white
                        ${toast.type === 'error' ? 'border-red-500 bg-red-50' :
                                    toast.type === 'success' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}
                        >
                            <div className="flex-shrink-0 mr-3">
                                {toast.type === 'success' && <FcCheckmark size={20} />}
                                {toast.type === 'error' && <FcHighPriority size={20} />}
                                {toast.type === 'info' && <FcInfo size={20} />}
                            </div>
                            <div className={`flex-1 text-sm font-medium ${toast.type === 'error' ? 'text-red-800' :
                                    toast.type === 'success' ? 'text-green-800' : 'text-blue-800'
                                }`}>
                                {toast.message}
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-400 hover:text-gray-600">
                                ×
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
