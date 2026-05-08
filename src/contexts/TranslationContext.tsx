import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary, type Language, type Dictionary } from '../utils/dictionary';

interface TranslationContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Dictionary;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('pamasahe-lang') as Language;
    if (saved && (saved === 'en' || saved === 'tl')) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('pamasahe-lang', newLang);
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang: handleSetLang, t: dictionary[lang] }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};
