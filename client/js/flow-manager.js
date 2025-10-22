import { initAuthManager } from "./auth/auth-manager.js";
import { initializeChat } from "./chat.js";

let currentSessionUsername = null;

export const startChatSession = (username) => {
  const loginModal = document.getElementById('login-modal');
  const loginOverlay = document.getElementById('login-overlay');
  const chatViewMain = document.querySelector('main');

  if (loginModal) loginModal.classList.add('hidden');
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (chatViewMain) chatViewMain.classList.remove('hidden');

  currentSessionUsername = username;
  initializeChat(username);
};

export const initFlow = () => {
  const chatViewMain = document.querySelector('main');
  if (chatViewMain) chatViewMain.classList.add('hidden');
  initAuthManager();
};

export const getCurrentSessionUsername = () => currentSessionUsername;
