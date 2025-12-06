import {
  onChatHistory,
  onChatMessage,
  onForceDisconnect,
  onUserCount,
  onRateLimitError,
  onValidationError,
  onError
} from "../sockets/socket.js";
import { getSeparatorIfNewDay, resetLastDisplayedDate } from "../utils/date-separator-manager.js";
import addMessage from "../message/message-render.js";
import { playNotification } from "../notifications/notifications.js";
import { incrementCounter } from "../notifications/unread-message-counter.js";
import { applyTranslations } from "../translations/translations-apply.js";

const setupSocketHandler = (socket, currentUserId, username, areUnreadMessagesCounterEnabled) => {
  const messagesContainer = document.querySelector('.chat-messages');
  
  // Manejo de historial
  onChatHistory(socket, (messages) => {
    messagesContainer.innerHTML = '';
    resetLastDisplayedDate();
    messages.forEach(msg => {
      const separator = getSeparatorIfNewDay(msg.timestamp);
      const isOwn = (msg.userId && msg.userId === currentUserId) || (!msg.userId && msg.username === username);
      // const isOwn = msg.userId === currentUserId;
      addMessage(msg, isOwn, separator);
    });
  });

  // Manejo de mensajes nuevos
  onChatMessage(socket, (msgObj) => {
    const separator = getSeparatorIfNewDay(msgObj.timestamp);
    const isOwn = msgObj.userId === currentUserId;
    addMessage(msgObj, isOwn, separator);

    if (!isOwn) {
      playNotification();
      if (areUnreadMessagesCounterEnabled()) incrementCounter();
    };
  });

  // Manejo de contador de usuarios
  onUserCount(socket, (count) => {
    const onlineCount = document.getElementById('online-count');
    if (onlineCount) onlineCount.textContent = count;
  });

  onRateLimitError(socket, (data) => {
    alert(`⏱️ ${data.message}\nPuedes enviar otro mensaje en ${data.retryAfter} segundos.`); //REVISAR DE CREAR UNA NOTIFICACIÓN MÁS ELABORADA
  });

  onValidationError(socket, (data) => {
    alert(`❌ Validation error: ${data.message}`);
  });

  onError(socket, (error) => {
    console.error('Socket error:', error);
    alert(`❌ Error: ${error.message}`);
  });
  
  onForceDisconnect(socket, (data) => {
    console.warn('Disconnected by server:', data.reason);
    socket.disconnect();
    const headerRight = document.querySelector('.header-right');
    if (headerRight) headerRight.style.display = 'none';
    //alert(`You have been disconnected by the server. Reason: ${data.reason}`);

    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:2rem;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 4rem; color: var(--text); margin-bottom: 1rem;"></i>
          <h2 style="font-size: var(--font-size-xxl); margin-bottom: 1rem;" translate-key="sessionDisconnectedTitle">Session disconnected</h2>
          <p style="font-size: var(--font-size-lg);" translate-key="sessionDisconnectedMessage">You have opened the chat in another tab or device.</p>
          <button onclick="location.reload()" style="margin-top: 2rem; padding: 1rem 2rem; border-radius: 1rem; border: none; background: var(--green-light); cursor: pointer; font-size: var(--font-size-lg);" translate-key="useHereButton">
            Use here
          </button>
        </div>
      `;
      applyTranslations();
    };
  });
};

export default setupSocketHandler;