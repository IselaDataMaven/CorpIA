import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiEye,
  HiEyeSlash,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi2";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../context/AuthContext";
import { DEMO_USERS } from "../../data/demoUsers";

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ username, password, rememberMe });
      navigate(from, { replace: true });
    } catch {
      setError(t("login.errorInvalid"));
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoUser = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setError("");
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)]">
      {/* Panel izquierdo: identidad de marca */}
      <div className="relative hidden w-1/2 overflow-hidden bg-[var(--color-secondary)] lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.2),transparent_50%)]" />
        <div className="relative z-10">
          <Logo size="lg" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <h1 className="text-4xl font-bold leading-tight text-white">
            {t("app.tagline")}
          </h1>
          <p className="mt-4 text-base text-slate-300">
            {i18n.language === "en"
              ? "One place to ask, search and understand everything your company knows."
              : i18n.language === "pt"
                ? "Um só lugar para perguntar, buscar e entender tudo o que sua empresa sabe."
                : "Un solo lugar para preguntar, buscar y entender todo lo que tu empresa sabe."}
          </p>
        </motion.div>
        <p className="relative z-10 text-sm text-slate-500">CorpIA © 2026</p>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="md" />
          </div>

          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            {t("login.welcomeTitle")}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {t("login.welcomeSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                {t("login.username")}
              </label>
              <div className="relative">
                <HiOutlineUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("login.usernamePlaceholder")}
                  className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)]
                    bg-[var(--color-surface-light)] py-3 pl-10 pr-4 text-base text-[var(--color-text-primary)]
                    outline-none transition focus:border-[var(--color-primary)]
                    dark:bg-white/5 dark:text-[var(--color-text-dark)] dark:border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                {t("login.password")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)]
                    bg-[var(--color-surface-light)] py-3 pl-10 pr-11 text-base text-[var(--color-text-primary)]
                    outline-none transition focus:border-[var(--color-primary)]
                    dark:bg-white/5 dark:text-[var(--color-text-dark)] dark:border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                {t("login.rememberMe")}
              </label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? t("login.signingIn") : t("login.signIn")}
            </Button>
          </form>

          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              {t("login.demoUsersTitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {DEMO_USERS.map((demoUser) => (
                <button
                  key={demoUser.id}
                  type="button"
                  onClick={() => fillDemoUser(demoUser)}
                  className="rounded-full border border-[var(--color-border)] px-3.5 py-1.5 text-xs font-medium
                    text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)]
                    hover:text-[var(--color-primary)] dark:border-white/10"
                >
                  {t(`roles.${demoUser.roleKey}`)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
