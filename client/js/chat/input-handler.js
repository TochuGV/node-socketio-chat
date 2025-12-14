import socketService from "../sockets/socket.js";

const setupInputHandler = (socket, userId, username) => {
  const input = document.querySelector('.chat-input input');
  const sendTextButton = document.getElementById('send-text');
  const sendAudioButton = document.getElementById('send-audio');
  const charCount = document.getElementById('char-count');
  const maxLength = input.getAttribute('maxLength') || 500;

  let typingTimeout = null;
  let isTyping = false;

  const handleInputInteraction = () => {
    const currentLength = input.value.length;
    const remaining = maxLength - currentLength;
    const hasText = input.value.trim().length > 0;

    if (charCount) {
      charCount.textContent = remaining;
      if (remaining <= 100) {
        charCount.style.opacity = '1'; // Hacer visible
        if (remaining <= 20) charCount.classList.add('warning');
        else charCount.classList.remove('warning');
      } else {
        charCount.style.opacity = '0'; // Ocultar si sobra espacio
      };
    };

    if (hasText) {
      sendTextButton.style.display = '';
      sendAudioButton.style.display = 'none';
    } else {
      sendTextButton.style.display = 'none';
      sendAudioButton.style.display = '';
    };

    if (hasText) {
      if (!isTyping) {
        isTyping = true;
        socketService.emitters.sendTyping();
      };

      if (typingTimeout) clearTimeout(typingTimeout);

      typingTimeout = setTimeout(() => {
        isTyping = false;
        socketService.emitters.sendStopTyping();
      }, 1500);
    } else if (isTyping) {
      isTyping = false;
      socketService.emitters.sendStopTyping();
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  };

  // Evento de envío de texto
  sendTextButton.addEventListener('click', (e) => {
    e.preventDefault();
    const message = input.value;
    if (message.trim() !== '') {
      socketService.emitters.sendTextMessage(message);
      input.value = '';
      handleInputInteraction();
    }
  });

  // Envío con Enter
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendTextButton.click();
    }
  });

  // Actualización de botones al escribir
  input.addEventListener('input', handleInputInteraction);

  // Inicializar estado de botones
  handleInputInteraction();
};

export default setupInputHandler;