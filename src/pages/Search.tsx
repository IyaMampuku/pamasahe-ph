import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search as SearchIcon, Clock, Home as HomeIcon, Briefcase, Plus, Star } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { searchLocation, type NominatimResult } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  useTranslation();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      const res = await searchLocation(debouncedQuery);
      setResults(res);
      setLoading(false);
    };
    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (result: NominatimResult) => {
    navigate('/results', { state: { destination: result } });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      <div className="bg-white p-4 pt-6 shadow-md z-10">
        <div className="flex items-center space-x-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 h-12 border border-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1a00b2]/20 transition-all">
            <SearchIcon size={20} className="text-gray-400 mr-3" />
            <input 
              type="text"
              autoFocus
              className="bg-transparent border-none outline-none flex-1 w-full text-base font-medium"
              placeholder="Search here"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          <QuickAction icon={<HomeIcon size={18} />} label="Home" sub="Tolentino St" />
          <QuickAction icon={<Briefcase size={18} />} label="Work" sub="Set location" />
          <QuickAction icon={<Plus size={18} />} label="More" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a00b2]" />
          </div>
        )}
        
        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
              Search Results
            </h2>
            {results.map((res) => (
              <SearchResult key={res.place_id} res={res} onClick={() => handleSelect(res)} />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent</h3>
                <span className="text-[10px] font-bold text-[#1a00b2] uppercase tracking-wider">History</span>
              </div>
              
              <RecentItem 
                icon={<Star size={20} className="fill-yellow-400 text-yellow-400" />} 
                label="Tolentino St" 
                sub="Las Piñas, Metro Manila" 
              />
              <RecentItem 
                icon={<Clock size={20} />} 
                label="Friendship Gate" 
                sub="Talon Singko, Molino VI, Las Piñas" 
              />
              <RecentItem 
                icon={<Clock size={20} />} 
                label="NITORI Mall of Asia" 
                sub="3rd Floor, SM Mall of Asia, Seaside Blvd"
                status="Open • Closes 10:00 PM"
              />
              <RecentItem 
                icon={<Clock size={20} />} 
                label="PITX Gateway" 
                sub="Parañaque City" 
              />
            </div>
            
            <div className="text-center py-4">
              <button className="text-sm font-bold text-blue-600 hover:underline">
                More from recent history
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; sub?: string }> = ({ icon, label, sub }) => (
  <button className="flex items-center space-x-3 px-4 py-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm shrink-0 active:scale-95 transition-transform">
    <div className="p-2 bg-blue-50 text-[#1a00b2] rounded-xl">
      {icon}
    </div>
    <div className="text-left">
      <p className="text-sm font-bold text-gray-800">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 font-medium truncate max-w-[80px]">{sub}</p>}
    </div>
  </button>
);

const RecentItem: React.FC<{ icon: React.ReactNode; label: string; sub?: string; status?: string }> = ({ icon, label, sub, status }) => (
  <button className="w-full flex items-start space-x-4 p-2 group active:bg-gray-100 rounded-xl transition-colors">
    <div className="mt-1 text-gray-400 group-active:text-[#1a00b2] transition-colors">
      {icon}
    </div>
    <div className="flex-1 text-left border-b border-gray-100 pb-4 group-last:border-none">
      <p className="font-bold text-gray-800">{label}</p>
      {sub && <p className="text-xs text-gray-500 line-clamp-1">{sub}</p>}
      {status && <p className="text-[10px] font-bold text-green-600 mt-1">{status}</p>}
    </div>
  </button>
);

const SearchResult: React.FC<{ res: NominatimResult; onClick: () => void }> = ({ res, onClick }) => {
  const parts = res.display_name.split(',');
  const mainTitle = parts.length > 1 && parts[0].length < 10 
    ? `${parts[0].trim()}, ${parts[1].trim()}` 
    : parts[0].trim();
  const subTitle = parts.length > 1 && parts[0].length < 10 
    ? parts.slice(2).join(',').trim() 
    : parts.slice(1).join(',').trim();

  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-3 hover:bg-gray-50 transition-colors active:scale-[0.98]"
    >
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1a00b2] shrink-0">
        <MapPin size={20} />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="font-bold text-gray-900 truncate">
          {mainTitle}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {subTitle || 'Philippines'}
        </p>
      </div>
    </button>
  );
};

