import { initSocket, onConnect, onChatHistory, onChatMessage, onUserCount, sendTextMessage, sendAudioMessage } from "./sockets/socket.js";
import { startRecording, stopRecording } from "./audio/audio.js";
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

updateSendButtons();

let isRecording = false;

sendAudioButton.addEventListener('click', () => {
  if (!isRecording) {
    isRecording = true;
    sendAudioButton.classList.add('recording');
    sendAudioButton.textContent = '🔴 Grabando...';
    startRecording((base64Audio, audioBlob, error) => {
      isRecording = false;
      sendAudioButton.classList.remove('recording');
      sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone"></i>';;
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

/*
const volumeSlider = document.getElementById('volume-slider');

if (volumeSlider) {
  volumeSlider.value = getVolume();
  volumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
  });
};
*/