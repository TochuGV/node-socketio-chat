import setActiveButton from "../utils/set-active-button.js"

const STORAGE_KEY = "chat-font-size";
const groupSelector = ".button-group";
const root = document.documentElement;

const sizeMap = {
  small: '0.9', // Ver 0.75
  medium: '1',
  large: '1.1' // Ver 1.25
};

const applyFontSize = (size = 'medium') => {
  const scaleFactor = sizeMap[size] || sizeMap['medium'];
  root.style.setProperty('--font-scale-factor', scaleFactor);
  localStorage.setItem(STORAGE_KEY, size);
};

export const initFontSizeButtons = () => {
  const buttons = {
    small: document.getElementById('font-size-small'),
    medium: document.getElementById('font-size-medium'),
    large: document.getElementById('font-size-large'),
  };

  if (!buttons.small || !buttons.medium || !buttons.large) return;

  const updateActiveButton = (size) => setActiveButton(groupSelector, `#font-size-${size}`);
  const storedPreference = localStorage.getItem(STORAGE_KEY) || 'medium';
  applyFontSize(storedPreference);
  updateActiveButton(storedPreference);

  Object.entries(buttons).forEach(([size, button]) => {
    button.addEventListener('click', () => {
      applyFontSize(size);
      updateActiveButton(size);
    });
  });
};