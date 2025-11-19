import { initSocket, onConnect, registerUsername } from "./sockets/socket.js";
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

export const initializeChat = (username) => {
  const socket = initSocket();
  const areUnreadMessagesCounterEnabled = initToggleUnreadMessagesCounter();

  window.addEventListener("focus", () => {
    resetCounter();
  });

  onConnect(socket, (id) => {
    console.log('Connected with ID:', id);
    registerUsername(socket, username)
  });

  setupSocketHandler(socket, username, areUnreadMessagesCounterEnabled);
  setupInputHandler(socket, username);
  setupAudioHandler(socket, username);

  initSettings();
  initVolumeSlider();
  initLanguageButtons();
  initToggleOnlineStatus(socket);
  initTheme();
  initThemeButtons();
  initFontSizeButtons();
};

document.addEventListener('DOMContentLoaded', () => {
  initFlow();
});