export default function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`rounded-[var(--radius-card)] border border-[var(--color-border)]/60
        bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]
        dark:border-white/10 shadow-lg transition-shadow duration-200
        hover:shadow-xl ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
