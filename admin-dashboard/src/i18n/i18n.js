import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from './locales/en/translation.json';
import trTranslations from './locales/tr/translation.json';

// Default language
const defaultLanguage = 'en';

// Initialize i18n
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: false,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false // Not needed for React as it escapes by default
    },
    resources: {
      en: {
        translation: enTranslations,
      },
      tr: {
        translation: trTranslations,
      },
    },
  });

export default i18n;
