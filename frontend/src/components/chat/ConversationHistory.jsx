import { HiOutlinePlus, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

export default function ConversationHistory({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  isLoading,
}) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--color-border)]/60 dark:border-white/10">
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[var(--color-primary-hover)]"
        >
          <HiOutlinePlus size={16} />
          Nueva conversación
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {isLoading && (
          <p className="px-2 py-3 text-xs text-[var(--color-text-secondary)]">
            Cargando historial…
          </p>
        )}
        {!isLoading && conversations.length === 0 && (
          <p className="px-2 py-3 text-xs text-[var(--color-text-secondary)]">
            Todavía no tienes conversaciones.
          </p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              conv.id === activeId
                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                : "text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <HiOutlineChatBubbleOvalLeft size={16} className="shrink-0" />
            <span className="truncate">{conv.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
