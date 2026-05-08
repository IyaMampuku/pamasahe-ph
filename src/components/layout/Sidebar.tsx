import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, Globe, LogOut, Info, Shield } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { lang, setLang } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
    onClose();
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'tl' : 'en');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-[#1a00b2] text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <User size={32} className="text-white" />
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <h2 className="text-xl font-bold">Admin User</h2>
              <p className="text-white/70 text-sm">admin@pamasahe.ph</p>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
              <MenuItem icon={<User size={20} />} label="My Profile" />
              <MenuItem icon={<Settings size={20} />} label="Settings" />
              
              <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</div>
              <button 
                onClick={toggleLanguage}
                className="w-full flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="text-[#1a00b2] mr-4"><Globe size={20} /></div>
                <div className="flex-1 text-left font-medium">Language</div>
                <div className="text-xs bg-blue-100 text-[#1a00b2] px-2 py-1 rounded-full font-bold">
                  {lang === 'en' ? 'English' : 'Tagalog'}
                </div>
              </button>

              <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</div>
              <MenuItem icon={<Info size={20} />} label="Help Center" />
              <MenuItem icon={<Shield size={20} />} label="Privacy Policy" />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut size={20} className="mr-3" />
                Logout
              </button>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium">v1.0.0-beta</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="w-full flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors">
    <div className="text-[#1a00b2] mr-4">{icon}</div>
    <span className="font-medium">{label}</span>
  </button>
);
