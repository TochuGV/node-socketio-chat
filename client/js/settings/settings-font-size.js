import initSettingsGroup from "../utils/button-group-helper.js";

const STORAGE_KEY = "chat-font-size";
const root = document.documentElement;

const sizeMap = {
  small: '0.8', // Ver 0.75
  medium: '1',
  large: '1.2' // Ver 1.25
};

const applyFontSize = (size = 'medium') => {
  const scaleFactor = sizeMap[size] || sizeMap['medium'];
  root.style.setProperty('--font-scale-factor', scaleFactor);
  localStorage.setItem(STORAGE_KEY, size);
};

const getStoredFontSize = () => {
  return localStorage.getItem(STORAGE_KEY);
}

export const initFontSizeButtons = () => {
  initSettingsGroup({
    buttons: {
      small: document.getElementById('font-size-small'),
      medium: document.getElementById('font-size-medium'),
      large: document.getElementById('font-size-large')
    },
    buttonIdPrefix: 'font-size',
    onSelect: applyFontSize,
    getStoredValue: getStoredFontSize,
    defaultValue: 'medium'
  });
};