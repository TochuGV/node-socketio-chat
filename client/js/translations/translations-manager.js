import es from './es.js';
import en from './en.js';

const translations = { es, en };

let currentLang = localStorage.getItem("lang") || "es";

export const t = (key) => {
  return translations[currentLang][key] || key;
};

export const getLanguage = () => { //Por ahora, no se usa nunca esta función.
  return currentLang;
};

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
  };
};