import { setTheme, getStoredPreference } from '../theme/theme.js';
import setActiveButton from '../utils/set-active-button.js';

export const initThemeButtons = () => {
  const groupSelector = '.button-group';
  const buttons = {
    light: document.getElementById('theme-light'),
    dark: document.getElementById('theme-dark'),
    auto: document.getElementById('theme-auto')
  }

  if(!buttons.light && !buttons.dark && !buttons.auto) return; // Si faltan todos, nada que hacer. Si falta alguno, los inicializamos igual.
  //if(!buttons.light || !buttons.dark || !buttons.auto) return; // Si falta alguno, nada que hacer
  const updateActiveButton = (preference) => setActiveButton(groupSelector, `#theme-${preference}`);
  const storedPreference = getStoredPreference();
  updateActiveButton(storedPreference);

  /*
  buttons.light?.addEventListener('click', () => {
    setTheme('light');
    updateActiveButton('light');
  });
  buttons.dark?.addEventListener('click', () => {
    setTheme('dark');
    updateActiveButton('dark');
  });
  buttons.auto?.addEventListener('click', () => {
    setTheme('auto');
    updateActiveButton('auto');
  });
  */

  Object.entries(buttons).forEach(([mode, button]) => { //'Object.entries' crea un vector con pares [clave, valor] de un objeto
    if(!button) return;
    button.addEventListener('click', () => {
      setTheme(mode);
      updateActiveButton(mode);
    });
  });
};