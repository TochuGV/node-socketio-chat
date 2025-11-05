import { initCustomAudioPlayer } from "../audio/audio-player.js";

const addMessage = ({ username, message, audio, audioType, timestamp }, isOwn = false, dateSeparatorElement = null) => {
  const messagesContainer = document.querySelector('.chat-messages');
  if (!messagesContainer) {
    console.warn('addMessage: .chat-messages container not found');
    return;
  };

  if (dateSeparatorElement) messagesContainer.appendChild(dateSeparatorElement);
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isOwn ? 'own-message' : 'other-message');

  let time = '';
  if (timestamp) {
    const date = new Date(timestamp);
    time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  let userText = username || 'Other user';
  let headerText = `<strong>${userText}</strong>`;
  if (time) headerText += ` <span class="timestamp">${time}</span>`;

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

export default addMessage;