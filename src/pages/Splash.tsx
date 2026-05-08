import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { Button } from '../components/ui/Button';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#1a00b2] text-white p-6 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="w-24 h-24 bg-[#f2ca4b] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(242,202,75,0.4)]">
          <MapPin size={48} className="text-[#1a00b2]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Pamasahe PH</h1>
        <p className="text-lg opacity-90">{t.splash.tagline}</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-10 w-full px-6"
      >
        <Button 
          variant="secondary" 
          fullWidth 
          size="lg"
          onClick={() => navigate('/language')}
        >
          {t.splash.next}
        </Button>
      </motion.div>
    </div>
  );
};
