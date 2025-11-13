import { setTheme, getStoredPreference } from '../theme/theme.js';
import { initSettingsGroup } from '../utils/button-group-helper.js';

export const initThemeButtons = () => {
  initSettingsGroup({
    buttons: {
      light: document.getElementById('theme-light'),
      dark: document.getElementById('theme-dark'),
      auto: document.getElementById('theme-auto')
    },
    buttonIdPrefix: 'theme',
    onSelect: setTheme,
    getStoredValue: getStoredPreference,
    defaultValue: 'auto'
  });
};