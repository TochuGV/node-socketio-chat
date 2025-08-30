import { t, setLanguage } from './translations-manager.js';

const TRANSLATE_ATTRIBUTE = 'translate-key';

const applyTranslations = () => {
  document.querySelectorAll(`[${TRANSLATE_ATTRIBUTE}]`).forEach(el => {
    const key = el.getAttribute(TRANSLATE_ATTRIBUTE);
    'placeholder' in el ? el.placeholder = t(key) : el.textContent = t(key);
  });
};

export const initLanguageButtons = () => {
  const buttonEs = document.getElementById('button-es');
  const buttonEn = document.getElementById('button-en');

  buttonEs?.addEventListener('click', () => {
    setLanguage('es');
    applyTranslations();
  });

  buttonEn?.addEventListener('click', () => {
    setLanguage('en');
    applyTranslations();
  });

  applyTranslations();
};