import { useEffect, useRef, useState } from "react";
import { HiOutlinePaperAirplane, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Card from "../../components/common/Card";
import MessageBubble from "../../components/chat/MessageBubble";
import ConversationHistory from "../../components/chat/ConversationHistory";
import { streamChatMessage, listConversations, getConversation } from "../../api/chatApi";

let idCounter = 0;
const localId = () => `local-${Date.now()}-${idCounter++}`;

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorBanner, setErrorBanner] = useState("");
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  const refreshConversations = () => {
    listConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setIsLoadingHistory(false));
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = async (id) => {
    setConversationId(id);
    setErrorBanner("");
    try {
      const detail = await getConversation(id);
      setMessages(
        detail.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          references: m.references || [],
        }))
      );
    } catch {
      setErrorBanner("No se pudo cargar esa conversación.");
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setErrorBanner("");
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    setErrorBanner("");
    const userMsg = { id: localId(), role: "user", content: text };
    const assistantMsg = { id: localId(), role: "assistant", content: "", references: [] };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChatMessage({
        message: text,
        conversationId,
        signal: controller.signal,
        onEvent: (evt) => {
          if (evt.type === "meta") {
            if (!conversationId) setConversationId(evt.conversation_id);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, references: evt.references } : m
              )
            );
          } else if (evt.type === "token") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: m.content + evt.content } : m
              )
            );
          }
        },
      });
      refreshConversations();
    } catch (err) {
      if (err.name !== "AbortError") {
        setErrorBanner(
          "No se pudo conectar con el backend de CorpIA. Verifica que esté corriendo en http://localhost:8000."
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => prev.slice(0, -2));
    sendMessage(lastUser.content);
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <Card className="flex h-[calc(100vh-13rem)] overflow-hidden p-0">
      <ConversationHistory
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNewConversation={handleNewConversation}
        isLoading={isLoadingHistory}
      />

      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-[var(--color-text-secondary)]">
              <HiOutlineChatBubbleLeftRight size={40} className="text-[var(--color-primary)]" />
              <p className="max-w-sm text-sm">
                Pregúntale a CorpIA sobre cualquier documento de la base de
                conocimiento de la empresa.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isLastAssistant={m.id === lastAssistantId && !isStreaming}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>

        {errorBanner && (
          <div className="mx-6 mb-2 rounded-xl bg-[var(--color-error)]/10 px-4 py-2 text-sm text-[var(--color-error)]">
            {errorBanner}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-t border-[var(--color-border)]/60 p-4 dark:border-white/10"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre los documentos de la empresa..."
            disabled={isStreaming}
            className="flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] disabled:opacity-60 dark:border-white/10"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white shadow-md transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlinePaperAirplane size={18} />
          </button>
        </form>
      </div>
    </Card>
  );
}
