import { useTranslation } from "react-i18next";
import {
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi2";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

export default function Header({ onToggleSidebar }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-[var(--color-border)]/60
        bg-[var(--color-surface-light)]/80 px-6 backdrop-blur dark:bg-[var(--color-surface-dark)]/80
        dark:border-white/10"
    >
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
        aria-label="toggle sidebar"
      >
        <HiOutlineBars3 size={22} />
      </button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder={t("header.searchPlaceholder")}
          className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-transparent
            py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]
            dark:border-white/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-1 rounded-full border border-[var(--color-border)] p-1 dark:border-white/10 sm:flex">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                i18n.language === lang.code
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          aria-label="toggle theme"
          className="rounded-lg p-2.5 text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
        >
          {theme === "dark" ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
        </button>

        <button
          aria-label={t("header.notifications")}
          className="relative rounded-lg p-2.5 text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
        >
          <HiOutlineBell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-error)]" />
        </button>

        {user && (
          <div className="ml-1 flex items-center gap-2.5 pl-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="hidden leading-tight lg:block">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                {user.fullName}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {t(`roles.${user.roleKey}`)}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
