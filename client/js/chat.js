import { initSocket, onConnect, onChatHistory, onChatMessage, onUserCount, sendTextMessage, sendAudioMessage } from "./sockets/socket.js";
import { playNotification, getVolume, setVolume } from "./notifications/notifications.js";

const socket = initSocket();
let mySocketId = null;

const messagesContainer = document.querySelector('.chat-messages');
const input = document.querySelector('.chat-input input');
const sendTextButton = document.getElementById('send-text');
const sendAudioButton = document.getElementById('send-audio');

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
  if(!isOwn) playNotification();
});

onUserCount(socket, (count) => {
  const onlineCount = document.getElementById('online-count');
  if (onlineCount) onlineCount.textContent = count;
});

function addMessage({ username, message, audio, audioType, timestamp }, isOwn = false){
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isOwn ? 'own-message' : 'other-message');

  // Format time as HH:MM:SS
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
    bodyHTML = `<div class="message-body">${message}</div>`;
  } else if (audio && audioType){
    bodyHTML = `<audio controls src="data:${audioType};base64,${audio}"></audio>`;
  };

  messageElement.innerHTML = `
    <div class="message-header">${headerText}</div>
    ${bodyHTML}
  `;

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

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

// Inicializar estado de los botones al cargar
updateSendButtons();

let mediaRecorder;
let audioChunks = [];

sendAudioButton.addEventListener('click', async () => {
  if(!mediaRecorder || mediaRecorder.state === 'inactive') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if(event.data.size > 0) {
          audioChunks.push(event.data);
        };
      });

      mediaRecorder.addEventListener('stop', async() => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = arrayBufferToBase64(arrayBuffer);
        
        socket.emit('chat message', {
          audioBuffer: base64Audio,
          audioType: audioBlob.type
        });
      });

      mediaRecorder.start();
      sendAudioButton.classList.add('recording');
      sendAudioButton.textContent = '🔴 Grabando...';
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Asegúrate de que esté conectado y permitido.');
    };
  } else {
    mediaRecorder.stop();
    sendAudioButton.classList.remove('recording');
    sendAudioButton.textContent = '🎤';
  };
});

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  };
  return btoa(binary);
};

const volumeSlider = document.getElementById('volume-slider');

if (volumeSlider) {
  volumeSlider.value = getVolume();
  volumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
  });
};