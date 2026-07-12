import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiOutlineSquares2X2,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCircleStack,
  HiOutlineDocumentText,
  HiOutlineCpuChip,
  HiOutlineUsers,
  HiOutlineKey,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", key: "dashboard", icon: HiOutlineSquares2X2 },
  { to: "/chat", key: "chat", icon: HiOutlineChatBubbleLeftRight },
  { to: "/knowledge-base", key: "knowledgeBase", icon: HiOutlineCircleStack },
  { to: "/documents", key: "documents", icon: HiOutlineDocumentText },
  { to: "/models", key: "models", icon: HiOutlineCpuChip },
  { to: "/users", key: "users", icon: HiOutlineUsers },
  { to: "/api-keys", key: "apiKeys", icon: HiOutlineKey },
  { to: "/settings", key: "settings", icon: HiOutlineCog6Tooth },
];

export default function Sidebar({ isOpen, onNavigate }) {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--color-border)]/60
        bg-[var(--color-surface-light)] transition-transform duration-300 dark:bg-[var(--color-surface-dark)]
        dark:border-white/10 lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex h-20 items-center px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-md"
                  : "text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              }`
            }
          >
            <Icon size={20} />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)]/60 p-4 dark:border-white/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium
            text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/10"
        >
          <HiOutlineArrowRightOnRectangle size={20} />
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
