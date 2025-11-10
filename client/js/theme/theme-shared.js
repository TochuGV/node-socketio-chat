window.ThemeUtils = {
  STORAGE_KEY: "chat-theme-preference",

  getSystemPreference: () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  applyTheme: (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    };
  }
};