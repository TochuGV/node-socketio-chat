import { getLanguage } from '../translations/translations-manager.js';

let lastDisplayedDate = null;

const formatDateToDay = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatDisplayDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const language = getLanguage();
  return date.toLocaleDateString(language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const createDateSeparatorElement = (timestamp) => {
  const dateString = formatDisplayDate(timestamp);
  const separator = document.createElement('div');
  separator.classList.add('date-separator');
  separator.setAttribute('data-timestamp', timestamp);
  separator.innerHTML = `
    <span class="date-line"></span>
    <span class="date-text">${dateString}</span>
    <span class="date-line"></span>
  `;
  return separator;
};

export const getSeparatorIfNewDay = (timestamp) => {
  const currentMessageDay = formatDateToDay(timestamp);
  if (currentMessageDay && currentMessageDay !== lastDisplayedDate) {
    const separator = createDateSeparatorElement(timestamp);
    lastDisplayedDate = currentMessageDay;
    return separator;
  };
  return null;
};

export const resetLastDisplayedDate = () => lastDisplayedDate = null;

export const updateDateSeparators = () => {
  const separators = document.querySelectorAll('.date-separator');
  separators.forEach(sep => {
    const timestamp = sep.getAttribute('data-timestamp');
    if (timestamp) {
      const newDateString = formatDisplayDate(timestamp);
      const textSpan = sep.querySelector('.date-text');
      if (textSpan) textSpan.textContent = newDateString;
    };
  });
};