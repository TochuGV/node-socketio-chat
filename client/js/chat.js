import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { playNotification, getVolume, setVolume } from "./notifications/notifications.js";

const socket = io();
let mySocketId = null;

const messagesContainer = document.querySelector('.chat-messages');
const input = document.querySelector('.chat-input input');
const button = document.querySelector('.chat-input button');

socket.on('connect', () => {
  mySocketId = socket.id;
  console.log('Connected with ID:', mySocketId);
});

function addMessage({ username, message, timestamp }, isOwn = false){
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isOwn ? 'own-message' : 'other-message');
  
  const time = new Date(timestamp).toLocaleTimeString();
  const headerText = isOwn ? `Tú [${time}]` : `${username || 'Otro usuario'} [${time}]`;

  messageElement.innerHTML = `
    <div class="message-header">${headerText}</div>
    <div class="message-body">${message}</div>
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
    socket.emit('chat message', message);
    input.value = '';
  };
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    button.click();
  };
});

const volumeSlider = document.getElementById('volume-slider');

if (volumeSlider) {
  volumeSlider.value = getVolume();
  volumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
  });
};