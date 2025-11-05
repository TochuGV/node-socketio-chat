import { initSocket, onConnect, onChatHistory, onChatMessage, onUserCount, registerUsername, sendTextMessage, sendAudioMessage } from "./sockets/socket.js";
import { startRecording, stopRecording } from "./audio/audio.js";
import { playNotification } from "./notifications/notifications.js";
import { initSettings } from "./settings/settings.js";
import { initVolumeSlider } from "./settings/settings-volume.js";
import { initToggleUnreadMessagesCounter } from "./settings/settings-notifications.js";
import { initLanguageButtons } from "./translations/translations-apply.js";
import { initToggleOnlineStatus } from "./settings/settings-online-status.js"
import { initTheme } from "./theme/theme.js";
import { initThemeButtons } from "./settings/settings-theme.js";
import { incrementCounter, resetCounter } from "./notifications/unread-message-counter.js";
import addMessage from "./message/message-render.js";
import { initFlow } from "./flow-manager.js";
import { getSeparatorIfNewDay, resetLastDisplayedDate } from "./utils/date-separator-manager.js";

export const initializeChat = (username) => {
  const socket = initSocket();
  let mySocketId = null;

  const messagesContainer = document.querySelector('.chat-messages');
  const input = document.querySelector('.chat-input input');
  const sendTextButton = document.getElementById('send-text');
  const sendAudioButton = document.getElementById('send-audio');
  const areUnreadMessagesCounterEnabled = initToggleUnreadMessagesCounter();

  window.addEventListener("focus", () => {
    resetCounter();
  })

  onConnect(socket, (id) => {
    mySocketId = id;
    console.log('Connected with ID:', mySocketId);
    registerUsername(socket, username)
  });

  onChatHistory(socket, (messages) => {
    messagesContainer.innerHTML = '';
    resetLastDisplayedDate();
    messages.forEach(msg => {
      const separator = getSeparatorIfNewDay(msg.timestamp);
      addMessage(msg, msg.username === username, separator);
    });
  });

  onChatMessage(socket, (msgObj) => {
    const separator = getSeparatorIfNewDay(msgObj.timestamp);
    const isOwn = msgObj.username === username;
    addMessage(msgObj, isOwn, separator);
    if (!isOwn) {
      playNotification();
      if (areUnreadMessagesCounterEnabled()) incrementCounter();
    };
  });

  onUserCount(socket, (count) => {
    const onlineCount = document.getElementById('online-count');
    if (onlineCount) onlineCount.textContent = count;
  });

  sendTextButton.addEventListener('click', (e) => {
    e.preventDefault();
    const message = input.value;
    if (message.trim() !== '') {
      sendTextMessage(socket, username, message);
      input.value = '';
      updateSendButtons();
    };
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendTextButton.click();
    }
  });

  const updateSendButtons = () => {
    if (input.value.trim().length > 0) {
      sendTextButton.style.display = '';
      sendAudioButton.style.display = 'none';
    } else {
      sendTextButton.style.display = 'none';
      sendAudioButton.style.display = '';
    };
  };

  updateSendButtons();

  input.addEventListener('input', updateSendButtons);

  let isRecording = false;

  sendAudioButton.addEventListener('click', () => {
    if (!isRecording) {
      isRecording = true;
      sendAudioButton.classList.add('recording');
      sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone fa-spin"></i>';
      startRecording((base64Audio, audioBlob, error) => {
        isRecording = false;
        sendAudioButton.classList.remove('recording');
        sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        if (error) {
          alert('No se pudo grabar el audio. ' + error.message);
          return;
        };
        if (base64Audio && audioBlob) sendAudioMessage(socket, username, base64Audio, audioBlob.type);
      });
    } else {
      stopRecording();
    };
  });

  initSettings();
  initVolumeSlider();
  initLanguageButtons();
  initToggleOnlineStatus(socket);
  initTheme();
  initThemeButtons();
};

document.addEventListener('DOMContentLoaded', () => {
  initFlow();
});