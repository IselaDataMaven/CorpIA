import { API_BASE_URL, apiClient } from "./client";

const SESSION_KEY = "corpia_session";

function getStoredToken() {
  const raw =
    localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw).token || null;
  } catch {
    return null;
  }
}

/**
 * Envía un mensaje al asistente y consume la respuesta en streaming (SSE).
 * onEvent recibe objetos { type: "meta" | "token" | "done", ... } a medida
 * que llegan del backend, permitiendo renderizar el texto token a token.
 */
export async function streamChatMessage({ message, conversationId, onEvent, signal }) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getStoredToken()}`,
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
    signal,
  });

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => "");
    throw new Error(errText || `Error del servidor (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const rawEvent of events) {
      const line = rawEvent.trim();
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice("data: ".length);
      try {
        onEvent(JSON.parse(jsonStr));
      } catch {
        // fragmento incompleto o no-JSON: se ignora, no rompe el stream
      }
    }
  }
}

export async function listConversations() {
  const { data } = await apiClient.get("/api/chat/conversations");
  return data;
}

export async function getConversation(conversationId) {
  const { data } = await apiClient.get(`/api/chat/conversations/${conversationId}`);
  return data;
}

export async function renameConversation(conversationId, title) {
  const { data } = await apiClient.put(`/api/chat/conversations/${conversationId}`, { title });
  return data;
}

export async function deleteConversation(conversationId) {
  const { data } = await apiClient.delete(`/api/chat/conversations/${conversationId}`);
  return data;
}
