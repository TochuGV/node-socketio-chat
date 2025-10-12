const body = document.body;
const STORAGE_KEY = "chat-theme-preference";

const applyTheme = (theme) => {
  if(theme === 'dark'){
    body.classList.add('dark-theme');
  } else {
    body.classList.remove('dark-theme');
  };
};

const getSystemPreference = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getStoredPreference = () => {
  return localStorage.getItem(STORAGE_KEY) || 'auto';
};

export const setTheme = (preference) => {
  localStorage.setItem(STORAGE_KEY, preference);
  let finalTheme;
  if(preference === 'auto'){
    finalTheme = getSystemPreference();
  } else {
    finalTheme = preference;
  };

  applyTheme(finalTheme);
};

export const initTheme = () => {
  const storedPreference = getStoredPreference();
  setTheme(storedPreference);

  if(storedPreference === 'auto'){

    const systemChangeListener = () => {
      setTheme('auto');
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', systemChangeListener);
    return () => mediaQuery.removeEventListener('change', systemChangeListener);
  };
};