import { useEffect, useState } from "react";
import { HiOutlineCheckCircle, HiOutlineCpuChip, HiOutlineSparkles } from "react-icons/hi2";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { SkeletonCard } from "../../components/common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";
import { listModels, getModelCatalog, activateModel, setDefaultModel } from "../../api/modelsApi";

export default function Models() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.roleKey === "admin";

  const [models, setModels] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState(null);
  const [selectedModel, setSelectedModel] = useState({});

  const refresh = () => {
    Promise.all([listModels(), getModelCatalog()])
      .then(([modelsData, catalogData]) => {
        setModels(modelsData);
        setCatalog(catalogData);
        const initialSelection = {};
        modelsData.forEach((m) => {
          const catalogEntry = catalogData.find((c) => c.provider === m.provider);
          initialSelection[m.provider] =
            m.default_model || catalogEntry?.models?.[0]?.id || "";
        });
        setSelectedModel(initialSelection);
      })
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActivate = async (provider) => {
    setBusyProvider(provider);
    try {
      await activateModel(provider);
      showToast("Modelo activado correctamente.", "success");
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleSaveDefault = async (provider) => {
    setBusyProvider(provider);
    try {
      await setDefaultModel(provider, selectedModel[provider]);
      showToast("Modelo por defecto guardado.", "success");
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  const localOption = {
    provider: "corpia-local",
    key_masked: "—",
    is_active: models.length > 0 && models.every((m) => !m.is_active),
  };
  const allOptions = [localOption, ...models];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            Modelos IA
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Elige qué proveedor y modelo responde en el Chat. Sin ninguna API key configurada,
            CorpIA usa su motor local (extractivo, basado en tus documentos).
          </p>
        </div>
        <Link
          to="/api-keys"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Gestionar API Keys →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {allOptions.map((m) => {
            const catalogEntry = catalog.find((c) => c.provider === m.provider);
            const label =
              m.provider === "corpia-local" ? "CorpIA Local" : catalogEntry?.label || m.provider;
            const isConfigured = m.provider === "corpia-local" || m.key_masked !== "Sin configurar";
            const canActivate = m.provider === "corpia-local" || isConfigured;

            return (
              <Card key={m.provider} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    {m.provider === "corpia-local" ? (
                      <HiOutlineSparkles size={22} />
                    ) : (
                      <HiOutlineCpuChip size={22} />
                    )}
                  </div>
                  {m.is_active && (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-success)]">
                      <HiOutlineCheckCircle size={14} /> Activo
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                    {label}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {m.provider === "corpia-local"
                      ? "Motor extractivo local, sin API key"
                      : isConfigured
                      ? `Key: ${m.key_masked}`
                      : "Sin API key configurada"}
                  </p>
                </div>

                {catalogEntry && catalogEntry.models.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Modelo por defecto
                    </label>
                    <select
                      disabled={!isAdmin || !isConfigured}
                      value={selectedModel[m.provider] || ""}
                      onChange={(e) =>
                        setSelectedModel((prev) => ({ ...prev, [m.provider]: e.target.value }))
                      }
                      className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60 dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
                    >
                      {catalogEntry.models.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-auto flex gap-2">
                    <Button
                      variant={m.is_active ? "secondary" : "primary"}
                      className="flex-1 !py-2 !text-sm"
                      isLoading={busyProvider === m.provider}
                      disabled={m.is_active || !canActivate}
                      onClick={() => handleActivate(m.provider)}
                    >
                      {m.is_active ? "En uso" : "Activar"}
                    </Button>
                    {catalogEntry && catalogEntry.models.length > 0 && isConfigured && (
                      <Button
                        variant="ghost"
                        className="!py-2 !text-sm"
                        isLoading={busyProvider === m.provider}
                        onClick={() => handleSaveDefault(m.provider)}
                      >
                        Guardar
                      </Button>
                    )}
                  </div>
                )}
                {!isConfigured && m.provider !== "corpia-local" && (
                  <Link
                    to="/api-keys"
                    className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Configurar API key para activarlo →
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!isAdmin && (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Solo un Administrador puede activar modelos o cambiar el modelo por defecto.
        </p>
      )}
    </div>
  );
}
