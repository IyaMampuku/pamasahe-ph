import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { Button } from '../components/ui/Button';

export const Language: React.FC = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

  const handleContinue = () => {
    navigate('/auth');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-[100dvh] bg-gray-50 p-6"
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-[#1a00b2]">
          <Languages size={40} />
        </div>
        <h1 className="text-3xl font-bold text-[#1a00b2]">{t.language.select}</h1>

        <div className="w-full space-y-4 max-w-sm">
          <button
            onClick={() => setLang('en')}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
              lang === 'en' ? 'border-[#1a00b2] bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-lg font-medium text-gray-800">{t.language.english}</span>
            {lang === 'en' && <div className="w-3 h-3 rounded-full bg-[#1a00b2]" />}
          </button>
          
          <button
            onClick={() => setLang('tl')}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
              lang === 'tl' ? 'border-[#1a00b2] bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-lg font-medium text-gray-800">{t.language.tagalog}</span>
            {lang === 'tl' && <div className="w-3 h-3 rounded-full bg-[#1a00b2]" />}
          </button>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button fullWidth size="lg" onClick={handleContinue}>
          {t.language.continue}
        </Button>
      </div>
    </motion.div>
  );
};
