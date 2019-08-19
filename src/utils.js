import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export default (objectRU, objectEN) => (
  i18next
    .use(LanguageDetector)
    .init({
      resources: {
        'ru-RU': {
          translation: { ...objectRU },
        },
        en: {
          translation: { ...objectEN },
        },
      },
    })
);
