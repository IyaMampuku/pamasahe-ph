import React, { createContext, useContext, useState } from 'react';
import { type NominatimResult } from '../services/api';

interface HistoryContextType {
  history: NominatimResult[];
  home: NominatimResult | null;
  work: NominatimResult | null;
  addToHistory: (location: NominatimResult) => void;
  setHomeLocation: (location: NominatimResult) => void;
  setWorkLocation: (location: NominatimResult) => void;
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

  const addToHistory = (location: NominatimResult) => {
    setHistory(prev => {
      // Remove if already exists to move to top
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

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pamasahe_history');
  };

  return (
    <HistoryContext.Provider value={{ 
      history, home, work, 
      addToHistory, setHomeLocation, setWorkLocation, clearHistory 
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
