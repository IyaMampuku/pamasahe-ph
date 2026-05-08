import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Crosshair } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation } from '../contexts/LocationContext';
import { LeafletMap } from '../components/map/LeafletMap';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { location, locateMe } = useLocation();

  return (
    <div className="flex flex-col h-[100dvh] relative bg-gray-100 overflow-hidden">
      {/* Top Overlay */}
      <div className="absolute top-0 inset-x-0 z-10 p-4 pt-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#1a00b2]">
            <Menu size={24} />
          </button>
          
          <div 
            onClick={() => navigate('/search')}
            className="flex-1 h-12 bg-white rounded-full flex items-center px-4 shadow-lg cursor-text"
          >
            <Search size={20} className="text-gray-400 mr-2" />
            <span className="text-gray-500 font-medium">{t.home.whereTo}</span>
          </div>
        </div>
      </div>

      {/* Map Body */}
      <div className="flex-1 relative z-0">
        {location && <LeafletMap center={location} markers={[{ position: location }]} />}
      </div>

      {/* Bottom Floating Button */}
      <div className="absolute bottom-6 right-4 z-10">
        <button 
          onClick={locateMe}
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl text-[#1a00b2] border border-gray-100"
        >
          <Crosshair size={28} />
        </button>
      </div>
    </div>
  );
};
