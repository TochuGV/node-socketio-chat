import { initAuthManager } from "./auth/auth-manager.js";
import { getOrCreateUserId } from "./auth/user-session.js";
import { initializeChat } from "./chat.js";
import { applyTranslations } from "./translations/translations-apply.js";

let currentSessionUserId = null;
let currentSessionUsername = null;

export const startChatSession = (username) => {
  const loginModal = document.getElementById('login-modal');
  const loginOverlay = document.getElementById('login-overlay');
  const chatViewMain = document.querySelector('main');

  localStorage.setItem('chat-username', username);
  document.body.classList.remove('login-active');

  if (loginModal) loginModal.classList.add('hidden');
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (chatViewMain) chatViewMain.classList.remove('hidden');

  currentSessionUserId = getOrCreateUserId();
  currentSessionUsername = username;
  initializeChat(currentSessionUserId, currentSessionUsername);
};

export const initFlow = () => {
  const chatViewMain = document.querySelector('main');
  const storedUsername = localStorage.getItem('chat-username');
  applyTranslations();
  if (storedUsername) {
    startChatSession(storedUsername);
  } else {
    document.body.classList.add('login-active');
    if (chatViewMain) chatViewMain.classList.add('hidden');
    initAuthManager();
  }
};

export const getCurrentSessionUsername = () => currentSessionUsername;