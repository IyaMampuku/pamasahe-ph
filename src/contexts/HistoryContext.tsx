import React, { createContext, useContext, useState } from 'react';
import { type NominatimResult } from '../services/api';

interface HistoryContextType {
  history: NominatimResult[];
  home: NominatimResult | null;
  work: NominatimResult | null;
  favorites: NominatimResult[];
  addToHistory: (location: NominatimResult) => void;
  setHomeLocation: (location: NominatimResult) => void;
  setWorkLocation: (location: NominatimResult) => void;
  toggleFavorite: (location: NominatimResult) => void;
  isFavorite: (placeId: number) => boolean;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NominatimResult[]>(() => {
    const saved = localStorage.getItem('pamasahe_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [home, setHome] = useState<NominatimResult | null>(() => {
    const saved = localStorage.getItem('pamasahe_home');
    return saved ? JSON.parse(saved) : null;
  });
  const [work, setWork] = useState<NominatimResult | null>(() => {
    const saved = localStorage.getItem('pamasahe_work');
    return saved ? JSON.parse(saved) : null;
  });
  const [favorites, setFavorites] = useState<NominatimResult[]>(() => {
    const saved = localStorage.getItem('pamasahe_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = (location: NominatimResult) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.place_id !== location.place_id);
      const newHistory = [location, ...filtered].slice(0, 10);
      localStorage.setItem('pamasahe_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const setHomeLocation = (location: NominatimResult) => {
    setHome(location);
    localStorage.setItem('pamasahe_home', JSON.stringify(location));
  };

  const setWorkLocation = (location: NominatimResult) => {
    setWork(location);
    localStorage.setItem('pamasahe_work', JSON.stringify(location));
  };

  const toggleFavorite = (location: NominatimResult) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.place_id === location.place_id);
      let newFavs;
      if (exists) {
        newFavs = prev.filter(item => item.place_id !== location.place_id);
      } else {
        newFavs = [location, ...prev];
      }
      localStorage.setItem('pamasahe_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (placeId: number) => favorites.some(item => item.place_id === placeId);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pamasahe_history');
  };

  return (
    <HistoryContext.Provider value={{ 
      history, home, work, favorites,
      addToHistory, setHomeLocation, setWorkLocation, toggleFavorite, isFavorite, clearHistory 
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
