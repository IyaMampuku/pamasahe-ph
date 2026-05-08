import React from 'react';
import { Map, Bookmark } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Map size={22} />, label: 'Explore', path: '/home' },
    { icon: <Bookmark size={22} />, label: 'Saved', path: '/saved' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-[60] flex justify-center items-center space-x-12 pt-2 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center transition-all duration-300 w-16 ${
              isActive ? 'text-[#1a00b2]' : 'text-gray-400'
            }`}
          >
            <div className="relative p-1.5 z-10 flex flex-col items-center">
              {item.icon}
              <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </div>
            {isActive && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute inset-0 bg-[#1a00b2]/10 rounded-2xl"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
