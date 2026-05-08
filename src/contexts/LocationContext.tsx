import React, { createContext, useContext, useState, useEffect } from 'react';

export type Coordinates = [number, number];

interface LocationContextType {
  location: Coordinates | null;
  error: string | null;
  locateMe: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const FALLBACK_LOCATION: Coordinates = [14.5895, 120.9816];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locateMe = React.useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation(FALLBACK_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLocation(FALLBACK_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locateMe();
  }, [locateMe]);

  return (
    <LocationContext.Provider value={{ location: location || FALLBACK_LOCATION, error, locateMe }}>
      {children}
    </LocationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
