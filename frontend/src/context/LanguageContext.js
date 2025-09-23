import React, { createContext, useState } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

const LanguageContext = createContext();

const translations = { en, hi };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;