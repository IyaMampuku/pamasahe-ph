import React, { useState } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Menu, Search, Crosshair, Map, Bookmark, MessageSquare } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation } from '../contexts/LocationContext';
import { LeafletMap } from '../components/map/LeafletMap';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomSheet } from '../components/layout/BottomSheet';

// ── Inline nav tabs (replaces standalone BottomNav on home) ──────────────────
const SheetNavTabs: React.FC = () => {
  const navigate  = useNavigate();
  const routePath = useRouterLocation().pathname;

  const tabs = [
    { icon: <Map size={22} />,      label: 'Explore',  path: '/home' },
    { icon: <Bookmark size={22} />, label: 'Saved',    path: '/saved' },
  ];

  return (
    <div className="flex items-center justify-center space-x-10 py-3 border-b border-gray-100">
      {tabs.map(tab => {
        const active = routePath === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 ${
              active ? 'bg-[#1a00b2]/10 text-[#1a00b2]' : 'text-gray-400'
            }`}
          >
            {tab.icon}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const { location, locateMe } = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [sheetSnap, setSheetSnap]       = useState(0);

  return (
    <div className="flex flex-col h-[100dvh] relative bg-gray-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Top overlay ── */}
      <div className="absolute top-0 inset-x-0 z-10 p-4 pt-6 bg-gradient-to-b from-black/25 to-transparent pointer-events-none">
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

      {/* ── Map ── */}
      <div className="flex-1 relative z-0">
        {location && (
          <LeafletMap
            center={location}
            markers={[{ position: location }]}
            className="w-full h-full"
          />
        )}
        <div className="absolute bottom-48 left-4 z-10 pointer-events-none">
          <h2 className="text-2xl font-black text-white/35 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] italic tracking-tighter">
            Pamasahe PH
          </h2>
        </div>
      </div>

      {/* ── Floating buttons — sit ABOVE the sheet ── */}
      {/* Center button rises based on sheet height so it never overlaps */}
      <div
        className="absolute right-5 z-40 transition-all duration-300"
        style={{ bottom: `calc(${sheetSnap === 0 ? 14 : sheetSnap === 1 ? 55 : 90}vh + 20px)` }}
      >
        <div className="flex flex-col space-y-4">
          <button
            onClick={locateMe}
            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl text-[#1a00b2] border border-gray-100 active:scale-90 transition-transform"
          >
            <Crosshair size={24} />
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="w-14 h-14 bg-[#1a00b2] rounded-2xl flex items-center justify-center shadow-xl text-white active:scale-90 transition-transform"
          >
            <MessageSquare size={24} />
          </button>
        </div>
      </div>

      {/* ── Bottom Sheet — nav tabs always visible as stickyHeader ── */}
      <BottomSheet
        isOpen={true}
        snapPoints={[14, 55, 90]}
        initialSnap={0}
        onSnapChange={setSheetSnap}
        stickyHeader={<SheetNavTabs />}
      >
        {/* Content only shows when sheet is expanded */}
        <div className="space-y-6 pt-4 pb-12">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Local vibe</h2>
            <div className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-1.5 rounded-2xl shadow-lg">
              <span className="text-xs font-bold">32°</span>
              <div className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="text-xs text-white/50">Sunny</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="px-1 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nearby Routes</span>
              <span className="text-[10px] font-bold text-[#1a00b2] uppercase tracking-wider">See All</span>
            </div>
            <RecentItem label="Baclaran - Heritage"  sub="High frequency • ₱13" />
            <RecentItem label="MOA - Buendia UV"     sub="Terminal active • ₱25" />
            <RecentItem label="PITX Loop"            sub="Main gateway • ₱15" />
          </div>

          <div className="space-y-4 pt-2">
            <div className="px-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Area Highlights</div>
            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
              <HighlightCard label="Food Hub"  count="12 spots" color="bg-orange-100 text-orange-700" />
              <HighlightCard label="Terminals" count="5 hubs"   color="bg-blue-100 text-blue-700"   />
              <HighlightCard label="Shopping"  count="8 malls"  color="bg-purple-100 text-purple-700"/>
            </div>
          </div>
        </div>
      </BottomSheet>
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
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  </button>
);

const HighlightCard: React.FC<{ label: string; count: string; color: string }> = ({ label, count, color }) => (
  <div className={`shrink-0 w-32 p-4 rounded-2xl shadow-sm ${color}`}>
    <p className="font-bold text-sm mb-1">{label}</p>
    <p className="text-xs opacity-70">{count}</p>
  </div>
);
