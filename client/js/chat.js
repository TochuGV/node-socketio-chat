import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { playNotification, getVolume, setVolume } from "./notifications/notifications.js";

const socket = io();
let mySocketId = null;

const messagesContainer = document.querySelector('.chat-messages');
const input = document.querySelector('.chat-input input');
const button = document.querySelector('.chat-input button');
const sendAudioButton = document.getElementById('send-audio');

socket.on('connect', () => {
  mySocketId = socket.id;
  console.log('Connected with ID:', mySocketId);
});

function addMessage({ username, message, audio, audioType, timestamp }, isOwn = false){
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isOwn ? 'own-message' : 'other-message');
  
  const time = new Date(timestamp).toLocaleTimeString();
  const headerText = isOwn ? `Tú [${time}]` : `${username || 'Otro usuario'} [${time}]`;

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

socket.on('chat history', (messages) => {
  messagesContainer.innerHTML = '';
  messages.forEach(msg => addMessage(msg, msg.username === mySocketId));
});

socket.on('chat message', (msgObj) => {
  const isOwn = msgObj.username === socket.id;
  addMessage(msgObj, isOwn);
  if(!isOwn) playNotification();
});

socket.on('userCount', (count) => {
  const counterEl = document.getElementById('user-counter')
  if (counterEl) {
    counterEl.innerText = `Connected users: ${count}`;
  };
})

button.addEventListener('click', () => {
  const message = input.value;
  if (message.trim() !== '') {
    //addMessage({ username: 'Tú', message, timestamp: new Date() }, true);
    socket.emit('chat message', {
      message: message,
      audio: null,
      audioType: null
    });
    input.value = '';
  };
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    button.click();
  };
});

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