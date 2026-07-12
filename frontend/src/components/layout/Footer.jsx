import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-[var(--color-border)]/60 px-6 py-4 text-xs text-[var(--color-text-secondary)] dark:border-white/10">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <span>
          CorpIA · {new Date().getFullYear()} · {t("footer.rights")}
        </span>
        <span className="font-mono">{t("footer.version")} 1.0.0</span>
      </div>
    </footer>
  );
}
