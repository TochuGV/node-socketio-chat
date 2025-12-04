(function() {
  const savedLang = localStorage.getItem('lang') || 'es';
  
  const loaderTranslations = {
    es: 'Cargando...',
    en: 'Loading...'
  };

  const textElement = document.getElementById('loader-text');
  if (textElement && loaderTranslations[savedLang]) {
    textElement.textContent = loaderTranslations[savedLang] || loaderTranslations['en'];
  };
})();