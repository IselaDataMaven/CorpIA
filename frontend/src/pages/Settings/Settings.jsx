import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineBuildingOffice2,
  HiOutlineLanguage,
  HiOutlineSwatch,
  HiOutlineGlobeAlt,
  HiOutlineServerStack,
} from "react-icons/hi2";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { Skeleton } from "../../components/common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";
import { fetchSettings, updateSettings } from "../../api/dashboardApi";
import { fetchSystemInfo } from "../../api/systemApi";

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

const TIMEZONES = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "Europe/Madrid",
  "UTC",
];

const FRONTEND_VERSION = "1.0.0";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const isAdmin = user?.roleKey === "admin";

  const [form, setForm] = useState({
    company_name: "",
    timezone: "America/Mexico_City",
    support_email: "",
    logo_url: "",
  });
  const [systemInfo, setSystemInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchSystemInfo()])
      .then(([settingsData, infoData]) => {
        setForm({
          company_name: settingsData.company_name,
          timezone: settingsData.timezone,
          support_email: settingsData.support_email,
          logo_url: settingsData.logo_url,
        });
        setSystemInfo(infoData);
      })
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({ ...form, language: i18n.language, theme });
      showToast("Configuración guardada correctamente.", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          {t("nav.settings")}
        </h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Preferencias generales de tu organización en CorpIA.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            <HiOutlineBuildingOffice2 size={20} />
            <h3 className="text-lg font-semibold">Empresa</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <TextField
                label="Nombre de la empresa"
                value={form.company_name}
                onChange={handleChange("company_name")}
                disabled={!isAdmin}
              />
              <TextField
                label="URL del logo"
                placeholder="https://tuempresa.com/logo.png"
                value={form.logo_url}
                onChange={handleChange("logo_url")}
                disabled={!isAdmin}
              />
              <TextField
                label="Correo de soporte"
                type="email"
                value={form.support_email}
                onChange={handleChange("support_email")}
                disabled={!isAdmin}
              />
            </>
          )}
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            <HiOutlineGlobeAlt size={20} />
            <h3 className="text-lg font-semibold">Zona horaria</h3>
          </div>
          <select
            value={form.timezone}
            onChange={handleChange("timezone")}
            disabled={!isAdmin}
            className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60 dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            <HiOutlineLanguage size={20} />
            <h3 className="text-lg font-semibold">Idioma</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  i18n.language === lang.code
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] dark:border-white/10"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            <HiOutlineSwatch size={20} />
            <h3 className="text-lg font-semibold">Tema</h3>
          </div>
          <div className="flex gap-2">
            {["light", "dark"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
                  theme === option
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] dark:border-white/10"
                }`}
              >
                {option === "light" ? "Claro" : "Oscuro"}
              </button>
            ))}
          </div>
        </Card>

        {isAdmin && (
          <Button type="submit" isLoading={isSaving}>
            Guardar cambios
          </Button>
        )}
        {!isAdmin && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Solo un Administrador puede guardar cambios en la configuración de la empresa.
          </p>
        )}
      </form>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          <HiOutlineServerStack size={20} />
          <h3 className="text-lg font-semibold">Información del servidor</h3>
        </div>
        {isLoading || !systemInfo ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Versión backend" value={systemInfo.backend_version} />
            <InfoRow label="Versión frontend" value={FRONTEND_VERSION} />
            <InfoRow label="Entorno" value={systemInfo.environment} />
            <InfoRow label="Python" value={systemInfo.python_version} />
            <InfoRow label="Plataforma" value={systemInfo.platform} />
            <InfoRow label="Uptime" value={`${systemInfo.uptime_seconds}s`} />
          </div>
        )}
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className="truncate font-mono text-xs text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
        {value}
      </p>
    </div>
  );
}
