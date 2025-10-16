import { initSocket, onConnect, onChatHistory, onChatMessage, onUserCount, sendTextMessage, sendAudioMessage } from "./sockets/socket.js";
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
});

onChatHistory(socket, (messages) => {
  messagesContainer.innerHTML = '';
  messages.forEach(msg => addMessage(msg, msg.username === mySocketId));
});

onChatMessage(socket, (msgObj) => {
  const isOwn = msgObj.username === socket.id;
  addMessage(msgObj, isOwn);
  if (!isOwn) {
    playNotification();
    if (areUnreadMessagesCounterEnabled()) incrementCounter();
  };
});

onUserCount(socket, (count) => {
  const onlineCount = document.getElementById('online-count');
  if (onlineCount) onlineCount.textContent = count;
});

function addMessage({ username, message, audio, audioType, timestamp }, isOwn = false){
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isOwn ? 'own-message' : 'other-message');

  let time = '';
  if (timestamp) {
    const date = new Date(timestamp);
    time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  let userText = isOwn ? 'You' : (username || 'Other user');
  let headerText = `<strong>${userText}</strong>`;
  if (time) headerText += ` <span class="timestamp">[${time}]</span>`;

  let bodyHTML = '';
  if (message) {
    bodyHTML = `<div class="body">${message}</div>`;
  } else if (audio && audioType){
    bodyHTML = `
      <div class="audio-body">
        <div class="custom-audio-player">
          <button class="audio-control-button"><i class="fa-solid fa-play"></i></button>
          <div class="audio-progress-bar"></div>
          <span class="audio-time-display">0:00</span>
          <audio preload="metadata" src="data:${audioType};base64,${audio}"></audio>
        </div>
      </div>
    `; // <button class="audio-control-button"><i class="fa-solid fa-ellipsis-vertical"></i></button>
  };

  messageElement.innerHTML = `
    <div class="message-header">${headerText}</div>
    ${bodyHTML}
  `;

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  if (audio && audioType) initCustomAudioPlayer(messageElement.querySelector('.custom-audio-player'));
};

// =========================================================
// NUEVA FUNCIÓN: Lógica de Reproducción de Audio Personalizado
// Esta función debe ser añadida al final de chat.js
// =========================================================

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const initCustomAudioPlayer = (messageElement) => {
  const audioEl = messageElement.querySelector('audio');
  const playButton = messageElement.querySelector('.audio-control-button i');
  const timeDisplay = messageElement.querySelector('.audio-time-display');
  const progressBar = messageElement.querySelector('.audio-progress-bar');

  if (!audioEl || !playButton || !timeDisplay) return;

  // 1. Mostrar la duración inicial
  audioEl.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = formatTime(audioEl.duration);
  });

  // 2. Controlar Play/Pause
  playButton.parentElement.addEventListener('click', () => {
    if (audioEl.paused) {
      audioEl.play().catch(error => console.error("Error playing audio:", error));
      playButton.classList.remove('fa-play');
      playButton.classList.add('fa-pause');
    } else {
      audioEl.pause();
      playButton.classList.remove('fa-pause');
      playButton.classList.add('fa-play');
    }
  });

  // 3. Actualizar tiempo y barra de progreso (Puntos 2 y 3)
  audioEl.addEventListener('timeupdate', () => {
    const elapsed = audioEl.currentTime;
    const duration = audioEl.duration;

    // Mostrar el tiempo transcurrido (sumando desde 0:00)
    timeDisplay.textContent = formatTime(elapsed); 

    // Actualizar la barra de progreso (relleno)
    if (isFinite(duration) && duration > 0) {
      const progressPercent = (elapsed / duration) * 100;
      progressBar.style.setProperty('--audio-progress', `${progressPercent}%`);
    }
  });

    // 4. Salto de Tiempo (Seeking) - ¡Funcionalidad Solicitada!
  progressBar.addEventListener('click', (e) => {
      // Asegúrate de que la duración esté disponible y sea válida
      if (!isFinite(audioEl.duration) || audioEl.duration <= 0) return;

      // Calcula la posición del clic como porcentaje del ancho de la barra
      const clickPosition = e.offsetX;
      const totalWidth = progressBar.offsetWidth;
      const clickPercent = clickPosition / totalWidth;

      // Calcula el nuevo tiempo y lo establece en el elemento de audio
      audioEl.currentTime = audioEl.duration * clickPercent;
        
      // No es necesario actualizar el display ni el progreso manualmente, 
      // el evento 'timeupdate' se dispara automáticamente al cambiar currentTime.
  });

  // 4. Resetear al finalizar
  audioEl.addEventListener('ended', () => {
    playButton.classList.remove('fa-pause');
    playButton.classList.add('fa-play');
    audioEl.currentTime = 0; // Opcional: reiniciar a 0
    timeDisplay.textContent = formatTime(audioEl.duration); // Muestra duración total al finalizar
    progressBar.style.setProperty('--audio-progress', `0%`);
  });
};

// ... Asegúrate de añadir `initCustomAudioPlayer` al final de chat.js si no la tienes
// La función `addMessage` ya llama a `initCustomAudioPlayer` al insertar el mensaje.

sendTextButton.addEventListener('click', (e) => {
  e.preventDefault();
  const message = input.value;
  if (message.trim() !== '') {
    sendTextMessage(socket, message);
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

input.addEventListener('input', updateSendButtons);

function updateSendButtons() {
  if (input.value.trim().length > 0) {
    sendTextButton.style.display = '';
    sendAudioButton.style.display = 'none';
  } else {
    sendTextButton.style.display = 'none';
    sendAudioButton.style.display = '';
  };
};

updateSendButtons();

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
      if (base64Audio && audioBlob) sendAudioMessage(socket, base64Audio, audioBlob.type);
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