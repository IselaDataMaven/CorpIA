export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-black/5 dark:bg-white/10 ${className}`}
    />
  );
}

export function SkeletonRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <Skeleton className="h-4 w-full max-w-[160px]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)]/60 p-6 dark:border-white/10">
      <Skeleton className="mb-4 h-11 w-11 rounded-2xl" />
      <Skeleton className="mb-2 h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
