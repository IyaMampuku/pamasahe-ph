import React from 'react';
import { Home, Map, Bookmark, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Map size={24} />, label: 'Explore', path: '/home' },
    { icon: <User size={24} />, label: 'You', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex justify-around items-center px-4 pt-3 pb-8 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              isActive ? 'text-[#1a00b2] scale-110' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-2xl ${isActive ? 'bg-[#1a00b2]/10' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
