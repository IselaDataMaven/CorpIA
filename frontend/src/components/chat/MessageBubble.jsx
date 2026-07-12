import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HiOutlineClipboard, HiOutlineArrowPath, HiOutlineDocumentText } from "react-icons/hi2";

export default function MessageBubble({ message, onRegenerate, isLastAssistant }) {
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.content || "");
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
            isUser
              ? "bg-[var(--color-primary)] text-white"
              : "border border-[var(--color-border)]/60 bg-[var(--color-surface-light)] text-[var(--color-text-primary)] dark:border-white/10 dark:bg-white/5 dark:text-[var(--color-text-dark)]"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.content ? (
            <div className="prose-corpia">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
            </span>
          )}
        </div>

        {!isUser && message.references?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.references.map((ref, idx) => (
              <span
                key={idx}
                title={ref.snippet}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] dark:border-white/10"
              >
                <HiOutlineDocumentText size={13} />
                {ref.document_name}
              </span>
            ))}
          </div>
        )}

        {!isUser && message.content && (
          <div className="mt-1.5 flex items-center gap-3 px-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              <HiOutlineClipboard size={14} /> Copiar
            </button>
            {isLastAssistant && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
              >
                <HiOutlineArrowPath size={14} /> Regenerar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay = "0s" }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-current opacity-60"
      style={{ animationDelay: delay }}
    />
  );
}
