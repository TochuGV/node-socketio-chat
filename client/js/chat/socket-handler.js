import socketService from "../sockets/socket.js";
import { getSeparatorIfNewDay, resetLastDisplayedDate } from "../utils/date-separator-manager.js";
import addMessage from "../message/message-render.js";
import { playNotification } from "../notifications/notifications.js";
import { incrementCounter } from "../notifications/unread-message-counter.js";
import { applyTranslations } from "../translations/translations-apply.js";
import { t } from "../translations/translations-manager.js";

const GUEST_INTERNAL_KEY = 'GUEST_USER';

const setupSocketHandler = (currentUserId, username, areUnreadMessagesCounterEnabled) => {
  const messagesContainer = document.querySelector('.chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');

  const typingMap = new Map();
  
  const updateTypingUI = () => {
    if (!typingIndicator) return;

    if(typingMap.size > 0) {
      const users = Array.from(typingMap.values());
      let text = '';

      if (users.length === 1) text = t('oneUserTyping').replace('{user}', users[0]);
      else if (users.length === 2) text = t('twoUsersTyping').replace('{user1}', users[0]).replace('{user2}', users[1]);
      else text = t('multipleUsersTyping').replace('{user1}', users[0]).replace('{user2}', users[1]);

      typingIndicator.textContent = text;
      typingIndicator.classList.add('visible');
    } else {
      typingIndicator.classList.remove('visible');
    };
  };

  socketService.listeners.onChatHistory((messages) => {
    messagesContainer.innerHTML = '';
    resetLastDisplayedDate();
    messages.forEach(msg => {
      const separator = getSeparatorIfNewDay(msg.timestamp);
      const isOwn = (msg.userId && msg.userId === currentUserId) || (!msg.userId && msg.username === username);
      addMessage(msg, isOwn, separator);
    });
  });

  socketService.listeners.onChatMessage((msgObj) => {
    const separator = getSeparatorIfNewDay(msgObj.timestamp);
    const isOwn = msgObj.userId === currentUserId;
    addMessage(msgObj, isOwn, separator);

    if (!isOwn) {
      playNotification();
      if (areUnreadMessagesCounterEnabled()) incrementCounter();

      if (typingMap.has(msgObj.userId)) {
        typingMap.delete(msgObj.userId);
        updateTypingUI();
      };
    };
  });

  socketService.listeners.onUserTyping((data) => {
    const name = data.username === GUEST_INTERNAL_KEY ? t('guestUserTyping') : data.username;
    typingMap.set(data.userId, name);
    updateTypingUI();
  });

  socketService.listeners.onUserStoppedTyping((data) => {
    typingMap.delete(data.userId);
    updateTypingUI();
  });

  socketService.listeners.onUserCount((count) => {
    const onlineCount = document.getElementById('online-count');
    if (onlineCount) onlineCount.textContent = count;
  });

  socketService.listeners.onRateLimitError((data) => {
    alert(`⏱️ ${data.message}\nPuedes enviar otro mensaje en ${data.retryAfter} segundos.`); //REVISAR DE CREAR UNA NOTIFICACIÓN MÁS ELABORADA
  });

  socketService.listeners.onValidationError((data) => {
    alert(`❌ Validation error: ${data.message}`);
  });

  socketService.listeners.onError((error) => {
    console.error('Socket error:', error);
    alert(`❌ Error: ${error.message}`);
  });

  socketService.listeners.onForceDisconnect((data) => {
    console.warn('Disconnected by server:', data.reason);
    if (socketService.socket) socketService.socket.disconnect();
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
          <button id="reconnect-button" style="margin-top: 2rem; padding: 1rem 2rem; border-radius: 1rem; border: none; background: var(--green-light); cursor: pointer; font-size: var(--font-size-lg);" translate-key="useHereButton">
            Use here
          </button>
        </div>
      `;

      const reconnectButton = document.getElementById('reconnect-button');
      if (reconnectButton) reconnectButton.addEventListener('click', () => location.reload());

      applyTranslations();
    };
  });
};

export default setupSocketHandler;