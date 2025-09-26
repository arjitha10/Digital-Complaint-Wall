import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, { type = "info", timeout = 3000 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (timeout) {
      setTimeout(() => remove(id), timeout);
    }
  }, [remove]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              `max-w-xs rounded shadow px-4 py-3 text-sm text-white ` +
              (t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-green-600" : "bg-gray-800")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
