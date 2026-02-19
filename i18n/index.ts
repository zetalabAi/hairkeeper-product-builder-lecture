import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

const LANGUAGE_STORAGE_KEY = 'user_language';
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'];

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

// SSR(서버)에서는 window가 없으므로 클라이언트에서만 실행
if (typeof window !== 'undefined') {
  AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      i18n.changeLanguage(saved);
    }
  });
}

export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  // SSR 안전
  if (typeof window !== 'undefined') {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
};

export default i18n;
