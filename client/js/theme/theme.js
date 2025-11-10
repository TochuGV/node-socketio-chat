const { STORAGE_KEY, MEDIA_QUERY_DARK, getSystemPreference, applyTheme } = window.ThemeUtils;

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
    const mediaQuery = window.matchMedia(MEDIA_QUERY_DARK);
    mediaQuery.removeEventListener('change', systemThemeListener);
  };

  if(storedPreference === 'auto'){
    const systemChangeListener = () => {
      setTheme('auto');
    };
    const mediaQuery = window.matchMedia(MEDIA_QUERY_DARK);
    mediaQuery.addEventListener('change', systemChangeListener);
  };
};