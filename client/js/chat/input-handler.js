import { sendTextMessage } from "../sockets/socket.js";

const setupInputHandler = (socket, userId, username) => {
  const input = document.querySelector('.chat-input input');
  const sendTextButton = document.getElementById('send-text');
  const sendAudioButton = document.getElementById('send-audio');
  const charCount = document.getElementById('char-count');

  const maxLength = input.getAttribute('maxLength') || 500;

  const handleInputInteraction = () => {
    const currentLength = input.value.length;
    const remaining = maxLength - currentLength;
    const hasText = input.value.trim().length > 0;

    // 1. Lógica del Contador
    if (charCount) {
      charCount.textContent = remaining;
      
      // REGLA DE ORO: Solo mostrar si faltan 100 caracteres o menos
      if (remaining <= 100) {
        charCount.style.opacity = '1'; // Hacer visible
        
        // Poner en rojo si es crítico (menos de 20)
        if (remaining <= 20) charCount.classList.add('warning');
        else charCount.classList.remove('warning');
      } else {
        charCount.style.opacity = '0'; // Ocultar si sobra espacio
      }
    }

    // 2. Lógica de Botones (Texto vs Audio)
    if (hasText) {
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
      sendTextMessage(socket, null, null, message);
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