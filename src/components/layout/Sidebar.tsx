import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, Globe, LogOut, Info, Shield, Edit2, Check, MessageSquareWarning, FileText } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalType = 'language' | 'privacy' | 'help' | null;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { lang, setLang } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    onClose();
  };

  const handleSetLang = (newLang: 'en' | 'tl') => {
    setLang(newLang);
    setActiveModal(null);
  };

  return (
    <>
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
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white z-[101] flex flex-col rounded-r-3xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 bg-[#1a00b2] text-white relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <User size={32} className="text-white" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#f2ca4b] rounded-full flex items-center justify-center shadow-lg text-[#1a00b2] border-2 border-[#1a00b2]">
                      <Edit2 size={14} className="font-bold" />
                    </button>
                  </div>
                  <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <h2 className="text-xl font-bold">Admin User</h2>
                <p className="text-white/70 text-sm">admin@pamasahe.ph</p>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
                <MenuItem icon={<User size={20} />} label="My Profile" onClick={() => {}} />
                <MenuItem icon={<Settings size={20} />} label="Settings" onClick={() => {}} />
                
                <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</div>
                <button 
                  onClick={() => setActiveModal('language')}
                  className="w-full flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-[#1a00b2] mr-4"><Globe size={20} /></div>
                  <div className="flex-1 text-left font-medium">Language</div>
                  <div className="text-xs bg-blue-100 text-[#1a00b2] px-2 py-1 rounded-full font-bold">
                    {lang === 'en' ? 'English' : 'Tagalog'}
                  </div>
                </button>

                <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</div>
                <MenuItem icon={<Info size={20} />} label="Help Center" onClick={() => setActiveModal('help')} />
                <MenuItem icon={<Shield size={20} />} label="Privacy Policy" onClick={() => setActiveModal('privacy')} />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
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

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              {activeModal === 'language' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-blue-50 text-[#1a00b2] rounded-2xl">
                      <Globe size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Select Language</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleSetLang('en')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${lang === 'en' ? 'border-[#1a00b2] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <span className="font-bold text-gray-800">English</span>
                      {lang === 'en' && <div className="w-6 h-6 bg-[#1a00b2] rounded-full flex items-center justify-center text-white"><Check size={14} /></div>}
                    </button>
                    <button 
                      onClick={() => handleSetLang('tl')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${lang === 'tl' ? 'border-[#1a00b2] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <span className="font-bold text-gray-800">Tagalog</span>
                      {lang === 'tl' && <div className="w-6 h-6 bg-[#1a00b2] rounded-full flex items-center justify-center text-white"><Check size={14} /></div>}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-blue-50 text-[#1a00b2] rounded-2xl">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Privacy Summary</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-600 space-y-2">
                      <span className="font-bold text-[#1a00b2] block mb-1">✨ AI Summary</span>
                      We collect basic location data to provide accurate transit routes. Your profile data is stored securely and never sold to third parties. 
                      <br/><br/>
                      By using Pamasahe PH, you agree to our standard terms of service. For full details, please visit our website.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4 bg-[#1a00b2] text-white font-bold rounded-2xl active:scale-95 transition-transform"
                  >
                    Got it
                  </button>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-blue-50 text-[#1a00b2] rounded-2xl">
                      <MessageSquareWarning size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">AI Help Center</h3>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      Hi! I'm your AI assistant. Have a bug to report or need help navigating? Describe the issue below and I'll log it for the team.
                    </p>
                    <textarea 
                      placeholder="Describe the issue..." 
                      className="w-full mt-4 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#1a00b2]/20 text-sm bg-white resize-none h-24"
                    ></textarea>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl active:scale-95 transition-transform"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-4 bg-[#1a00b2] text-white font-bold rounded-2xl active:scale-95 transition-transform"
                    >
                      Send Report
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors">
    <div className="text-[#1a00b2] mr-4">{icon}</div>
    <span className="font-medium">{label}</span>
  </button>
);
