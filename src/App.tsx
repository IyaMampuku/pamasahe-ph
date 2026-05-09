import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Splash } from './pages/Splash';
import { Language } from './pages/Language';
import { Auth } from './pages/Auth';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Results } from './pages/Results';
import { TripGuide } from './pages/TripGuide';
import { useAuth } from './contexts/AuthContext';
import { PamasaheGuide } from './components/ai/PamasaheGuide';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/pamasahe-ph">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/language" element={<Language />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/trip" element={<ProtectedRoute><TripGuide /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PamasaheGuide />
    </BrowserRouter>
  );
};

export default App;
