const STORAGE_KEY = "lumina_ai_chat_history_v1";
const MAX_CHATS = 200;

function makeId() {
  return globalThis.crypto?.randomUUID?.() ||
    `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readAll() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeAll(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function getChatHistory() {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getChatById(id) {
  return readAll().find(chat => chat.id === id) || null;
}

export function createChat(title = "New chat") {
  const chats = readAll();
  const now = new Date().toISOString();

  const chat = {
    id: makeId(),
    title: String(title).trim().slice(0, 120) || "New chat",
    messages: [],
    createdAt: now,
    updatedAt: now
  };

  writeAll([chat, ...chats].slice(0, MAX_CHATS));
  return chat;
}

export function saveChatMessage(chatId, message) {
  if (!chatId || !message || typeof message !== "object") {
    throw new Error("A chat ID and message object are required.");
  }

  const chats = readAll();
  const index = chats.findIndex(chat => chat.id === chatId);

  if (index < 0) throw new Error("Chat not found.");

  const item = {
    role: String(message.role || "user"),
    content: String(message.content ?? ""),
    createdAt: message.createdAt || new Date().toISOString()
  };

  chats[index].messages.push(item);

  if (chats[index].messages.length === 1 && item.content.trim()) {
    chats[index].title = item.content.trim().slice(0, 60);
  }

  chats[index].updatedAt = new Date().toISOString();
  writeAll(chats);
  return chats[index];
}

export function renameChat(chatId, title) {
  const chats = readAll();
  const chat = chats.find(item => item.id === chatId);
  if (!chat) return false;

  chat.title = String(title).trim().slice(0, 120) || "New chat";
  chat.updatedAt = new Date().toISOString();
  writeAll(chats);
  return true;
}

export function deleteChat(chatId) {
  const chats = readAll();
  const next = chats.filter(chat => chat.id !== chatId);
  if (next.length === chats.length) return false;

  writeAll(next);
  return true;
}

export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
