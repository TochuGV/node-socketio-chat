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
  };

  document.body.classList.remove('login-active');

  if (loginModal) loginModal.classList.add('hidden');
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (chatViewMain) chatViewMain.classList.remove('hidden');

  currentSessionUsername = username;
  initializeChat(currentSessionUserId, currentSessionUsername);
};

export const initFlow = async () => {
  const loader = document.getElementById('app-loader');
  const chatViewMain = document.querySelector('main');
  applyTranslations();
  
  const removeLoader = () => {
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    };
  };

  try {
    const response = await fetch('/auth/me');
    if (response.ok) {
      const data = await response.json();
      if (data.isAuthenticated) {
        console.log("Sesión autenticada encontrada:", data.user.username);
        startChatSession(data.user.username, data.user.id);
        removeLoader();
        return;
      }
    }
  } catch (error) {
    console.error("Hubo un error verificando la sesión:", error);
  };
  
  const storedUsername = localStorage.getItem('chat-username');

  if (storedUsername) {
    startChatSession(storedUsername);
  } else {
    document.body.classList.add('login-active');
    if (chatViewMain) chatViewMain.classList.add('hidden');
    initAuthManager();
  };

  removeLoader();
};

export const getCurrentSessionUsername = () => currentSessionUsername;