import { t, setLanguage, getLanguage } from './translations-manager.js';
import setActiveButton from '../utils/setActiveButton.js';

const TRANSLATE_ATTRIBUTE = 'translate-key';

export const applyTranslations = () => {
  document.querySelectorAll(`[${TRANSLATE_ATTRIBUTE}]`).forEach(el => {
    const key = el.getAttribute(TRANSLATE_ATTRIBUTE);
    if ('placeholder' in el) el.placeholder = t(key);
    else el.textContent = t(key);
  });
};

export const initLanguageButtons = () => {
  const groupSelector = '.button-group';
  const buttons = {
    es: document.getElementById('button-es'),
    en: document.getElementById('button-en')
  };

  if (!buttons.es && !buttons.en) return;

  const updateActiveButton = (language) => setActiveButton(groupSelector, `#button-${language}`);
  const stored = getLanguage();
  if (stored) updateActiveButton(stored);

  Object.entries(buttons).forEach(([lang, button]) => {
    if (!button) return;
    button.addEventListener('click', () => {
      setLanguage(lang);
      applyTranslations();
      updateActiveButton(lang);
    });
  });

  applyTranslations();
};