window.ThemeUtils = {
  STORAGE_KEY: "chat-theme-preference",
  MEDIA_QUERY_DARK: "(prefers-color-scheme: dark)",

  getSystemPreference: () => {
    return window.matchMedia && window.matchMedia(window.ThemeUtils.MEDIA_QUERY_DARK).matches;
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