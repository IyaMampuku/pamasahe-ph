import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Crosshair } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation } from '../contexts/LocationContext';
import { LeafletMap } from '../components/map/LeafletMap';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { location, locateMe } = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] relative bg-gray-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Top Overlay */}
      <div className="absolute top-0 inset-x-0 z-10 p-4 pt-6 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl text-[#1a00b2] active:scale-95 transition-transform"
          >
            <Menu size={24} />
          </button>
          
          <div 
            onClick={() => navigate('/search')}
            className="flex-1 h-12 bg-white rounded-3xl flex items-center px-4 shadow-xl cursor-text active:scale-[0.98] transition-transform"
          >
            <Search size={20} className="text-gray-400 mr-2" />
            <span className="text-gray-500 font-medium">{t.home.whereTo}</span>
          </div>
        </div>
      </div>

      {/* Map Body */}
      <div className="flex-1 relative z-0">
        {location && (
          <LeafletMap 
            center={location} 
            markers={[{ position: location }]} 
            className="w-full h-full"
          />
        )}
      </div>

      {/* Bottom Floating Button */}
      <div className="absolute bottom-40 right-4 z-10">
        <button 
          onClick={locateMe}
          className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-2xl text-[#1a00b2] border border-gray-50 active:scale-90 transition-transform"
        >
          <Crosshair size={28} />
        </button>
      </div>

      <BottomSheet isOpen={true} snapPoints={[20, 50, 85]} initialSnap={0}>
        <div className="space-y-6 pt-2 pb-32">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-[#1a00b2]">{t.home.whereTo}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="px-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Trips</div>
            <RecentItem label="SM Mall of Asia" sub="Pasay City" />
            <RecentItem label="Intramuros" sub="Manila" />
            <RecentItem label="Ayala Malls Manila Bay" sub="Parañaque" />
          </div>
        </div>
      </BottomSheet>

      <BottomNav />
    </div>
  );
};

const RecentItem: React.FC<{ label: string; sub: string }> = ({ label, sub }) => (
  <button className="w-full flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm text-[#1a00b2]">
      <Search size={20} />
    </div>
    <div className="text-left">
      <p className="font-bold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
  </button>
);


