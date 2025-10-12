import { setTheme, getStoredPreference } from '../theme/theme.js';

const updateActiveButton = (preference) => {
  // Selecciona todos los botones del grupo de tema que tienen IDs con el prefijo 'theme-'
  const themeButtons = document.querySelectorAll('.button-group button[id^="theme-"]');
  themeButtons.forEach(button => button.classList.remove('active-theme'));
  const targetId = `theme-${preference}`;
  const activeButton = document.getElementById(targetId);
  if (activeButton) activeButton.classList.add('active-theme');
};

export function initThemeButtons(){
  const lightButton = document.getElementById('theme-light');
  const darkButton = document.getElementById('theme-dark');
  const autoButton = document.getElementById('theme-auto');

  if(!lightButton || !darkButton || !autoButton) return;

  const storedPreference = getStoredPreference();
  updateActiveButton(storedPreference);

  lightButton?.addEventListener('click', () => {
    setTheme('light');
    updateActiveButton('light');
  });
  darkButton?.addEventListener('click', () => {
    setTheme('dark');
    updateActiveButton('dark');
  });
  autoButton?.addEventListener('click', () => {
    setTheme('auto');
    updateActiveButton('auto');
  });
};