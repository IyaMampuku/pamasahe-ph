import React, { createContext, useContext, useState } from 'react';
import { dictionary, type Language, type Dictionary } from '../utils/dictionary';

interface TranslationContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Dictionary;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('pamasahe-lang') as Language;
    return (saved && (saved === 'en' || saved === 'tl')) ? saved : 'en';
  });

  const handleSetLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('pamasahe-lang', newLang);
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang: handleSetLang, t: dictionary[lang] }}>
      {children}
    </TranslationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};
