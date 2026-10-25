import assert from 'node:assert/strict';
import * as history from '../src/lib/chatHistory.js';
import { CODING_MODES, buildCodingRequest } from '../src/lib/codingAssistant.js';

const memory = new Map();

globalThis.localStorage = {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: key => memory.delete(key),
  clear: () => memory.clear()
};

try {
  history.clearChatHistory();

  const chat = history.createChat('Feature verification');
  assert.ok(chat, 'Chat creation should return a chat');
  assert.ok(history.getChatById(chat.id), 'Created chat should be readable');

  history.saveChatMessage(chat.id, {
    role: 'user',
    content: 'Test message'
  });

  const updated = history.getChatById(chat.id);
  assert.ok(updated, 'Chat should remain readable after saving a message');

  history.renameChat(chat.id, 'Renamed test');
  assert.equal(
    history.getChatById(chat.id).title,
    'Renamed test',
    'Rename should update the title'
  );

  history.deleteChat(chat.id);
  assert.equal(history.getChatById(chat.id), null, 'Deleted chat should be absent');

  assert.equal(Object.keys(CODING_MODES).length, 6, 'All six coding modes should exist');

  const request = buildCodingRequest({
    mode: 'explain',
    request: 'Explain this code',
    code: 'console.log("Lumina")',
    error: ''
  });

  assert.ok(request, 'Coding request builder should return a request');

  console.log('PASS: Chat creation, reading, renaming and deletion');
  console.log('PASS: Six coding modes are available');
  console.log('PASS: Coding request builder returns a request');
} catch (error) {
  console.error('FAIL:', error.message);
  process.exitCode = 1;
} finally {
  history.clearChatHistory();
}
