import es from './es.js';
import en from './en.js';

const translations = { es, en };

let currentLang = localStorage.getItem("lang") || "es";

export function t(key){
  return translations[currentLang][key] || key;
};

export function getLanguage(){
  return currentLang;
};

export function setLanguage(lang){
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
  };
};