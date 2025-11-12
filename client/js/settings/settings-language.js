import { setLanguage, getLanguage } from '../translations/translations-manager.js';
import { applyTranslations } from '../translations/translations-apply.js';
import setActiveButton from '../utils/set-active-button.js';

export const initLanguageButtons = () => {
  const groupSelector = '.button-group';
  const buttons = {
    es: document.getElementById('button-es'),
    en: document.getElementById('button-en')
  };

  if (!buttons.es && !buttons.en) return;

  const updateActiveButton = (language) => setActiveButton(groupSelector, `#button-${language}`);
  const storedLanguage = getLanguage();
  if (storedLanguage) updateActiveButton(storedLanguage);

  Object.entries(buttons).forEach(([lang, button]) => {
    if (!button) return;
    button.addEventListener('click', () => {
      setLanguage(lang);
      applyTranslations();
      updateActiveButton(lang);
    });
  });
};