import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";

const ToastContext = createContext(null);

const ICONS = {
  success: { Icon: HiOutlineCheckCircle, color: "var(--color-success)" },
  error: { Icon: HiOutlineXCircle, color: "var(--color-error)" },
  warning: { Icon: HiOutlineExclamationTriangle, color: "var(--color-warning)" },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const { Icon, color } = ICONS[t.type] || ICONS.success;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-[var(--radius-card)]
                  border border-[var(--color-border)]/60 bg-[var(--color-surface-light)] p-4 shadow-2xl
                  dark:border-white/10 dark:bg-[var(--color-surface-dark)]"
              >
                <Icon size={20} style={{ color }} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                  {t.message}
                </p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-text-dark)]"
                >
                  <HiOutlineXMark size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
