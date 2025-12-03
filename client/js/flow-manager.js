import { initAuthManager } from "./auth/auth-manager.js";
import { getOrCreateUserId } from "./auth/user-session.js";
import { initializeChat } from "./chat.js";
import { applyTranslations } from "./translations/translations-apply.js";

let currentSessionUserId = null;
let currentSessionUsername = null;

export const startChatSession = (username, userId = null) => {
  const loginModal = document.getElementById('login-modal');
  const loginOverlay = document.getElementById('login-overlay');
  const chatViewMain = document.querySelector('main');

  if (!userId) {
    localStorage.setItem('chat-username', username);
    currentSessionUserId = getOrCreateUserId();
  } else {
    currentSessionUserId = userId;
  }

  //localStorage.setItem('chat-username', username);
  document.body.classList.remove('login-active');

  if (loginModal) loginModal.classList.add('hidden');
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (chatViewMain) chatViewMain.classList.remove('hidden');

  //currentSessionUserId = getOrCreateUserId();
  currentSessionUsername = username;
  initializeChat(currentSessionUserId, currentSessionUsername);
};

export const initFlow = async () => {
  const chatViewMain = document.querySelector('main');
  applyTranslations();
  
  try {
    const response = await fetch('/auth/me');
    if (response.ok) {
      const data = await response.json();
      if (data.isAuthenticated) {
        console.log("Sesión autenticada encontrada:", data.user.username);
        startChatSession(data.user.username, data.user.id);
        return;
      }
    }
  } catch (error) {
    console.error("Hubo un error verificando la sesión:", error);
  }
  
  const storedUsername = localStorage.getItem('chat-username');

  if (storedUsername) {
    startChatSession(storedUsername);
  } else {
    document.body.classList.add('login-active');
    if (chatViewMain) chatViewMain.classList.add('hidden');
    initAuthManager();
  }
};

export const getCurrentSessionUsername = () => currentSessionUsername;