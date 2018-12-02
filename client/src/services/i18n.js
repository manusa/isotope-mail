import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';

const userLanguage = () => navigator.language;

i18n
  .use(XHR)
  .init({
    lng: userLanguage(),
    fallbackLng: 'en',
    ns: ['isotope'],
    defaultNS: 'isotope',
    backend: {
      loadPath: 'assets/locales/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      wait: false,
      withRef: false,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  });

export default i18n;
