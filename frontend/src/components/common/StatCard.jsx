import Card from "./Card";

export default function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          {value}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      </div>
    </Card>
  );
}
