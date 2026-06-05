import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import authPtBr from './locales/pt-BR/auth.json';
import commonPtBr from './locales/pt-BR/common.json';
import coursePtBr from './locales/pt-BR/course.json';
import dashboardPtBr from './locales/pt-BR/dashboard.json';

export const defaultNS = 'common';
export const ns = ['common', 'auth', 'dashboard', 'course'] as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    defaultNS,
    ns,
    resources: {
      'pt-BR': {
        common: commonPtBr,
        auth: authPtBr,
        dashboard: dashboardPtBr,
        course: coursePtBr,
      },
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
