import { onChatHistory, onChatMessage, onUserCount } from "../sockets/socket.js";
import { getSeparatorIfNewDay, resetLastDisplayedDate } from "../utils/date-separator-manager.js";
import addMessage from "../message/message-render.js";
import { playNotification } from "../notifications/notifications.js";
import { incrementCounter } from "../notifications/unread-message-counter.js";

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
};

export default setupSocketHandler;