import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineCpuChip,
} from "react-icons/hi2";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import { fetchDashboardMetrics } from "../../api/dashboardApi";

export default function Dashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDashboardMetrics()
      .then((data) => mounted && setMetrics(data))
      .catch(() => mounted && setError("No se pudo conectar con el backend."))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {error && (
        <Card className="border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5 p-4 text-sm text-[var(--color-warning)]">
          {error} Verifica que el backend esté corriendo en{" "}
          <code className="font-mono">http://localhost:8000</code>.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={HiOutlineUsers}
          label={t("dashboard.usersCard")}
          value={isLoading ? "…" : metrics?.users ?? 0}
          accent="#2563EB"
        />
        <StatCard
          icon={HiOutlineChatBubbleLeftRight}
          label={t("dashboard.queriesCard")}
          value={isLoading ? "…" : metrics?.queries ?? 0}
          accent="#10B981"
        />
        <StatCard
          icon={HiOutlineDocumentText}
          label={t("dashboard.documentsCard")}
          value={isLoading ? "…" : metrics?.documents ?? 0}
          accent="#F59E0B"
        />
        <StatCard
          icon={HiOutlineCpuChip}
          label={t("dashboard.modelCard")}
          value={isLoading ? "…" : metrics?.active_model ?? "corpia-local"}
          accent="#3B82F6"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <h3 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            {t("dashboard.weeklyChart")}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={metrics?.weekly_queries ?? []}>
              <defs>
                <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.3} />
              <XAxis dataKey="day" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #CBD5E1" }} />
              <Area
                type="monotone"
                dataKey="consultas"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#colorQueries)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            Estado del sistema
          </h3>
          <div className="space-y-4">
            <StatusRow
              label={t("dashboard.serverStatus")}
              value={metrics ? t("dashboard.online") : "…"}
              ok={!!metrics}
            />
            <StatusRow
              label={t("dashboard.indexedDocs")}
              value={metrics?.indexed_documents ?? "…"}
              ok={!!metrics}
            />
            <StatusRow
              label="Fragmentos vectorizados"
              value={isLoading ? "…" : metrics?.vector_store_chunks ?? 0}
              ok={!!metrics}
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          {t("dashboard.lastQuestions")}
        </h3>
        {metrics?.last_questions?.length ? (
          <ul className="space-y-3">
            {metrics.last_questions.map((q, idx) => (
              <li
                key={idx}
                className="rounded-xl border border-[var(--color-border)]/60 px-4 py-3 text-sm text-[var(--color-text-secondary)] dark:border-white/10"
              >
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Todavía no hay preguntas registradas. Ve al Chat IA para empezar.
          </p>
        )}
      </Card>
    </div>
  );
}

function StatusRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span
        className={`flex items-center gap-1.5 text-sm font-semibold ${
          ok ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            ok ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
          }`}
        />
        {value}
      </span>
    </div>
  );
}
