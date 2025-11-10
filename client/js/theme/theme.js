const { STORAGE_KEY, getSystemPreference, applyTheme } = window.ThemeUtils;

const applyThemeByPreference = (theme) => {
  let isDark = false;
  if (theme === 'dark') {
    isDark = true;
  } else if (theme === 'auto') {
    isDark = getSystemPreference();
  };
  applyTheme(isDark);
};

export const getStoredPreference = () => {
  return localStorage.getItem(STORAGE_KEY) || 'auto';
};

export const setTheme = (preference) => {
  localStorage.setItem(STORAGE_KEY, preference);
  applyThemeByPreference(preference);
};

let systemThemeListener = null;

export const initTheme = () => {
  const storedPreference = getStoredPreference();
  setTheme(storedPreference);

  if (systemThemeListener) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', systemThemeListener);
  };

  if(storedPreference === 'auto'){
    const systemChangeListener = () => {
      setTheme('auto');
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', systemChangeListener);
  };
};