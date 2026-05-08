import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search as SearchIcon } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { searchLocation, type NominatimResult } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 3) {
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
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      <div className="bg-white p-4 pt-6 shadow-sm flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 h-12">
          <SearchIcon size={20} className="text-gray-400 mr-2" />
          <input 
            type="text"
            autoFocus
            className="bg-transparent border-none outline-none flex-1 w-full text-base"
            placeholder={t.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              {t.search.results}
            </h2>
            {results.map((res) => (
              <button 
                key={res.place_id}
                onClick={() => handleSelect(res)}
                className="w-full text-left p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1a00b2] shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-900 truncate">
                    {res.display_name.split(',')[0]}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {res.display_name.split(',').slice(1).join(',')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
