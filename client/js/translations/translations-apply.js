import { t } from './translations-manager.js';

const TRANSLATE_ATTRIBUTE = 'translate-key';

export const applyTranslations = () => {
  document.querySelectorAll(`[${TRANSLATE_ATTRIBUTE}]`).forEach(el => {
    const key = el.getAttribute(TRANSLATE_ATTRIBUTE);
    if ('placeholder' in el) el.placeholder = t(key);
    else el.textContent = t(key);
  });
};