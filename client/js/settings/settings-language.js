import { setLanguage, getLanguage } from '../translations/translations-manager.js';
import { applyTranslations } from '../translations/translations-apply.js';
import { initSettingsGroup } from '../utils/button-group-helper.js';

const applyLanguageWithTranslations = (language) => {
  setLanguage(language);
  applyTranslations();
};

export const initLanguageButtons = () => {
  initSettingsGroup({
    buttons: {
      es: document.getElementById('button-es'),
      en: document.getElementById('button-en')
    },
    buttonIdPrefix: 'button',
    onSelect: applyLanguageWithTranslations,
    getStoredValue: getLanguage,
    defaultValue: 'es'
  });
};