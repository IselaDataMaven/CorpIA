export default function TextField({ label, id, className = "", ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)]
          bg-[var(--color-surface-light)] px-4 py-2.5 text-sm text-[var(--color-text-primary)]
          outline-none transition focus:border-[var(--color-primary)]
          dark:bg-white/5 dark:text-[var(--color-text-dark)] dark:border-white/10"
        {...rest}
      />
    </div>
  );
}
