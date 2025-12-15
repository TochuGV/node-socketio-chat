import socketService from "./sockets/socket.js";
import { initSettings } from "./settings/settings.js";
import { initVolumeSlider } from "./settings/settings-volume.js";
import { initToggleUnreadMessagesCounter } from "./settings/settings-notifications.js";
import { initLanguageButtons } from "./settings/settings-language.js";
import { initToggleOnlineStatus } from "./settings/settings-online-status.js"
import { initTheme } from "./theme/theme.js";
import { initThemeButtons } from "./settings/settings-theme.js";
import { initFontSizeButtons } from "./settings/settings-font-size.js";
import { resetCounter } from "./notifications/unread-message-counter.js";
import { initFlow } from "./flow-manager.js";
import setupSocketHandler from "./chat/socket-handler.js";
import setupInputHandler from "./chat/input-handler.js";
import setupAudioHandler from "./chat/audio-handler.js";

export const initializeChat = (userId, username) => {
  const socket = socketService.init();
  window.debugSocket = socket; // Para depuración en consola
  const areUnreadMessagesCounterEnabled = initToggleUnreadMessagesCounter();

  window.addEventListener("focus", () => {
    resetCounter();
  });

  socketService.listeners.onConnect((id) => {
    console.log('Connected with ID:', id);
    socketService.emitters.registerUsername(userId, username);
  });

  setupSocketHandler(userId, username, areUnreadMessagesCounterEnabled);
  setupInputHandler(userId, username);
  setupAudioHandler(userId, username);

  initSettings();
  initVolumeSlider();
  initLanguageButtons();
  initToggleOnlineStatus();
  initTheme();
  initThemeButtons();
  initFontSizeButtons();
};

document.addEventListener('DOMContentLoaded', () => {
  initFlow();
});