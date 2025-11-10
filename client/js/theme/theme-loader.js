(function() {
  const { STORAGE_KEY, getSystemPreference, applyTheme } = window.ThemeUtils;
  
  const updateTheme = () => {
    const preference = localStorage.getItem(STORAGE_KEY) || 'auto';
    let finalThemeIsDark = false;
    
    if (preference === 'dark') {
      finalThemeIsDark = true;
    } else if (preference === 'auto') {
      finalThemeIsDark = getSystemPreference();
    }
  
    applyTheme(finalThemeIsDark);
  };
  
  updateTheme();
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const preference = localStorage.getItem(STORAGE_KEY) || 'auto';
    if (preference === 'auto') {
      updateTheme();
    };
  });
})();