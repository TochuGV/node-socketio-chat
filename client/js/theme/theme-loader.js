(function() {
  const { STORAGE_KEY, MEDIA_QUERY_DARK, getSystemPreference, applyTheme } = window.ThemeUtils;
  
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
  
  const mediaQuery = window.matchMedia(MEDIA_QUERY_DARK);
  mediaQuery.addEventListener('change', () => {
    const preference = localStorage.getItem(STORAGE_KEY) || 'auto';
    if (preference === 'auto') {
      updateTheme();
    };
  });
})();