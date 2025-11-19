import { sendTextMessage } from "../sockets/socket.js";

const setupInputHandler = (socket, username) => {
  const input = document.querySelector('.chat-input input');
  const sendTextButton = document.getElementById('send-text');
  const sendAudioButton = document.getElementById('send-audio');

  const updateSendButtons = () => {
    if (input.value.trim().length > 0) {
      sendTextButton.style.display = '';
      sendAudioButton.style.display = 'none';
    } else {
      sendTextButton.style.display = 'none';
      sendAudioButton.style.display = '';
    }
  };

  // Evento de envío de texto
  sendTextButton.addEventListener('click', (e) => {
    e.preventDefault();
    const message = input.value;
    if (message.trim() !== '') {
      sendTextMessage(socket, username, message);
      input.value = '';
      updateSendButtons();
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
  input.addEventListener('input', updateSendButtons);

  // Inicializar estado de botones
  updateSendButtons();
};

export default setupInputHandler;