import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2
              rounded-[var(--radius-modal)] border border-[var(--color-border)]/60 bg-[var(--color-surface-light)]
              p-6 shadow-2xl dark:border-white/10 dark:bg-[var(--color-surface-dark)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
