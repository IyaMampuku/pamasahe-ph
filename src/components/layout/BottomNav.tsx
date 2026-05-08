import React from 'react';
import { Map, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Map size={24} />, label: 'Explore', path: '/home' },
    { icon: <User size={24} />, label: 'You', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-[60] flex justify-around items-center px-8 pt-2 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center transition-all duration-300 ${
              isActive ? 'text-[#1a00b2]' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-[#1a00b2]/10' : ''}`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
