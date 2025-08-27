const overlay = document.getElementById('settings-overlay');
const modal = document.getElementById('settings-modal');
const menuButton = document.querySelector('.settings-menu-button');
const closeButton = document.querySelector('.close-button');

function openSettingsModal(){
  overlay.classList.add('active');
  modal.classList.add('active');
};

function closeSettingsModal(){
  overlay.classList.remove('active');
  modal.classList.remove('active');
};

menuButton.addEventListener('click', openSettingsModal);
closeButton.addEventListener('click', closeSettingsModal);
overlay.addEventListener('click', closeSettingsModal);