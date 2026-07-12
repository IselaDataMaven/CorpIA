import { useEffect, useState } from "react";
import {
  HiOutlineKey,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBolt,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineSignal,
} from "react-icons/hi2";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TextField from "../../components/common/TextField";
import { SkeletonCard } from "../../components/common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";
import {
  listModels,
  activateModel,
  setApiKey,
  deleteApiKey,
  testConnection,
} from "../../api/modelsApi";

const PROVIDER_META = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  claude: "Anthropic Claude",
  groq: "Groq",
  openrouter: "OpenRouter",
  mistral: "Mistral",
  deepseek: "DeepSeek",
  azure: "Azure OpenAI",
  ollama: "Ollama (local)",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ApiKeys() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.roleKey === "admin";

  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState(null);

  const [keyModalProvider, setKeyModalProvider] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [confirmDeleteProvider, setConfirmDeleteProvider] = useState(null);

  const refresh = () => {
    listModels()
      .then(setModels)
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const configurable = models.filter((m) => m.provider !== "ollama");

  const openAddEdit = (provider) => {
    setApiKeyInput("");
    setKeyModalProvider(provider);
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setBusyProvider(keyModalProvider);
    try {
      await setApiKey(keyModalProvider, apiKeyInput.trim());
      showToast("API key guardada correctamente.", "success");
      setKeyModalProvider(null);
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleDelete = async () => {
    setBusyProvider(confirmDeleteProvider);
    try {
      await deleteApiKey(confirmDeleteProvider);
      showToast("API key eliminada.", "success");
      setConfirmDeleteProvider(null);
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleActivate = async (provider) => {
    setBusyProvider(provider);
    try {
      await activateModel(provider);
      showToast(`${PROVIDER_META[provider]} activado como modelo principal.`, "success");
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleDeactivate = async () => {
    setBusyProvider("corpia-local");
    try {
      await activateModel("corpia-local");
      showToast("Se desactivó el proveedor; CorpIA usa ahora el motor local.", "success");
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  const handleTestConnection = async (provider) => {
    setBusyProvider(provider);
    try {
      const result = await testConnection(provider);
      showToast(result.detail, result.status === "ok" ? "success" : "error");
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          API Keys
        </h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Administra las credenciales de cada proveedor de IA. Las keys nunca se guardan en el
          navegador — siempre se envían y almacenan en el backend.
        </p>
      </div>

      {!isAdmin && (
        <div className="rounded-xl bg-[var(--color-warning)]/10 px-4 py-3 text-sm text-[var(--color-warning)]">
          Solo un Administrador puede agregar, editar o eliminar API keys.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {configurable.map((m) => {
            const isConfigured = m.key_masked !== "Sin configurar";
            return (
              <Card key={m.provider} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <HiOutlineKey size={20} />
                  </div>
                  {m.is_active ? (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-success)]">
                      <HiOutlineCheckCircle size={14} /> Activo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)] dark:bg-white/10">
                      Inactivo
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                    {PROVIDER_META[m.provider] || m.provider}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-[var(--color-text-secondary)]">
                    Key: {m.key_masked}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Modelo por defecto: {m.default_model || "sin definir"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Actualizado: {formatDate(m.updated_at)}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {m.last_validation_status === "ok" && (
                      <span className="flex items-center gap-1 font-medium text-[var(--color-success)]">
                        <HiOutlineCheckCircle size={14} /> Validado {formatDate(m.last_validated_at)}
                      </span>
                    )}
                    {m.last_validation_status === "error" && (
                      <span className="flex items-center gap-1 font-medium text-[var(--color-error)]">
                        <HiOutlineXCircle size={14} /> Falló {formatDate(m.last_validated_at)}
                      </span>
                    )}
                    {!m.last_validation_status && (
                      <span className="text-[var(--color-text-secondary)]">Sin validar todavía</span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="!py-2 !text-xs"
                      icon={isConfigured ? HiOutlinePencilSquare : HiOutlinePlus}
                      onClick={() => openAddEdit(m.provider)}
                    >
                      {isConfigured ? "Editar" : "Agregar"}
                    </Button>
                    {isConfigured && (
                      <>
                        <Button
                          variant="ghost"
                          className="!py-2 !text-xs"
                          icon={HiOutlineSignal}
                          isLoading={busyProvider === m.provider}
                          onClick={() => handleTestConnection(m.provider)}
                        >
                          Probar conexión
                        </Button>
                        {m.is_active ? (
                          <Button
                            variant="ghost"
                            className="!py-2 !text-xs"
                            isLoading={busyProvider === "corpia-local"}
                            onClick={handleDeactivate}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="!py-2 !text-xs"
                            icon={HiOutlineBolt}
                            isLoading={busyProvider === m.provider}
                            onClick={() => handleActivate(m.provider)}
                          >
                            Activar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="!py-2 !text-xs !text-[var(--color-error)]"
                          icon={HiOutlineTrash}
                          onClick={() => setConfirmDeleteProvider(m.provider)}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!keyModalProvider}
        onClose={() => setKeyModalProvider(null)}
        title={`Configurar API key · ${PROVIDER_META[keyModalProvider] || ""}`}
      >
        <form onSubmit={handleSaveKey} className="space-y-4">
          <TextField
            label="API Key"
            type="password"
            placeholder="Pega aquí la key copiada del proveedor"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-[var(--color-text-secondary)]">
            Se guarda cifrada en el servidor y solo se muestra enmascarada.
          </p>
          <Button type="submit" isLoading={busyProvider === keyModalProvider} className="w-full">
            Guardar API key
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteProvider}
        onClose={() => setConfirmDeleteProvider(null)}
        onConfirm={handleDelete}
        title="Eliminar API key"
        description={`Se eliminará la key de ${PROVIDER_META[confirmDeleteProvider] || ""}. Si estaba activa, CorpIA volverá a usar el motor local.`}
        confirmLabel="Eliminar"
        isLoading={busyProvider === confirmDeleteProvider}
      />
    </div>
  );
}
