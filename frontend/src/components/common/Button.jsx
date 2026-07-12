import { motion } from "framer-motion";

const VARIANTS = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-lg hover:shadow-xl",
  secondary:
    "bg-transparent text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)] border border-[var(--color-border)] hover:border-[var(--color-primary)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  isLoading = false,
  disabled = false,
  icon: Icon,
  onClick,
  className = "",
  ...rest
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)]
        px-5 py-3 text-base font-semibold transition-colors duration-200
        disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        Icon && <Icon size={18} />
      )}
      {children}
    </motion.button>
  );
}
