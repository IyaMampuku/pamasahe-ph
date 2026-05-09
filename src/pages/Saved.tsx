import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home as HomeIcon, Briefcase, Star, ChevronRight, Bookmark } from 'lucide-react';
import { useHistory } from '../contexts/HistoryContext';
import { type NominatimResult } from '../services/api';

export const Saved: React.FC = () => {
  const navigate = useNavigate();
  const { home, work, favorites } = useHistory();

  const handleSelect = (result: NominatimResult) => {
    navigate('/results', { state: { destination: result } });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 pt-6 shadow-sm z-10 flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Saved Places</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Quick Actions / Your Places */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Your Places</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <SavedRow 
              icon={<HomeIcon size={20} className="text-blue-600" />} 
              label="Home" 
              sub={home ? home.display_name.split(',')[0] : "Set your home address"}
              onClick={() => home ? handleSelect(home) : navigate('/search')}
            />
            <SavedRow 
              icon={<Briefcase size={20} className="text-purple-600" />} 
              label="Work" 
              sub={work ? work.display_name.split(',')[0] : "Set your work address"}
              onClick={() => work ? handleSelect(work) : navigate('/search')}
            />
          </div>
        </section>

        {/* Favorites */}
        <section className="space-y-3 pb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Saved Destinations</h2>
          {favorites.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {favorites.map((fav) => (
                <SavedRow 
                  key={fav.place_id}
                  icon={<Star size={20} className="text-yellow-500 fill-yellow-500" />} 
                  label={fav.display_name.split(',')[0]} 
                  sub={fav.display_name.split(',').slice(1, 3).join(',')}
                  onClick={() => handleSelect(fav)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
              <Bookmark size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium px-8">
                You haven't saved any destinations yet. Tap the star icon on your search results to save them here.
              </p>
              <button 
                onClick={() => navigate('/search')}
                className="mt-6 text-[#1a00b2] font-bold text-sm uppercase tracking-wider"
              >
                Start Searching
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

interface SavedRowProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}

const SavedRow: React.FC<SavedRowProps> = ({ icon, label, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-none group"
  >
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mr-4 group-active:scale-95 transition-transform">
      {icon}
    </div>
    <div className="text-left flex-1 overflow-hidden">
      <p className="font-bold text-gray-800 text-base">{label}</p>
      <p className="text-xs text-gray-500 truncate mt-0.5">{sub}</p>
    </div>
    <ChevronRight size={18} className="text-gray-300 ml-2" />
  </button>
);
