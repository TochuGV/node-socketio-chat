import { getUnreadMessageCount, resetCounter } from "../notifications/unread-message-counter.js";

const overlay = document.getElementById('settings-overlay');
const modal = document.getElementById('settings-modal');
const menuButton = document.querySelector('.settings-menu-button');
const closeButton = document.querySelector('.close-button');

const openSettingsModal = () => {
  overlay.classList.add('active');
  modal.classList.add('active');
};

const closeSettingsModal = () =>{
  overlay.classList.remove('active');
  modal.classList.remove('active');
  if (getUnreadMessageCount() > 0) resetCounter();
};

export const initSettings = () => {
  menuButton.addEventListener('click', openSettingsModal);
  closeButton.addEventListener('click', closeSettingsModal);
  overlay.addEventListener('click', closeSettingsModal);
};