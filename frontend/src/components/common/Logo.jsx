import { HiOutlineCpuChip } from "react-icons/hi2";

export default function Logo({ size = "md", withWordmark = true }) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  const text = { sm: "text-lg", md: "text-xl", lg: "text-3xl" }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        style={{ width: dims, height: dims }}
        className="flex items-center justify-center rounded-xl bg-gradient-to-br
          from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg"
      >
        <HiOutlineCpuChip size={dims * 0.6} />
      </div>
      {withWordmark && (
        <span
          className={`font-[var(--font-display)] font-bold tracking-tight ${text}
            text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]`}
        >
          Corp<span className="text-[var(--color-primary)]">IA</span>
        </span>
      )}
    </div>
  );
}
