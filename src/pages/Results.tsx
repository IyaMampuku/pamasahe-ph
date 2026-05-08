import React from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Clock, CreditCard } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { Button } from '../components/ui/Button';
import type { NominatimResult } from '../services/api';

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const routeLocation = useRouteLocation();
  const destination = routeLocation.state?.destination as NominatimResult;

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50">
        <p>No destination selected.</p>
        <Button onClick={() => navigate('/search')} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleStartTrip = () => {
    navigate('/trip', { state: { destination } });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      <div className="bg-[#1a00b2] p-4 pt-6 text-white pb-8">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Route Options</h1>
        </div>
        
        <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl">
          <MapPin size={24} className="text-[#f2ca4b]" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-blue-200">Destination</p>
            <p className="font-medium truncate">{destination.display_name.split(',')[0]}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 -mt-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          {t.results.recommended}
        </h2>
        
        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#1a00b2]">
                <Navigation size={20} />
              </div>
              <div>
                <p className="font-bold text-lg">Jeepney + Bus</p>
                <p className="text-sm text-gray-500">2 transfers</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-[#1a00b2]">35-50 {t.results.mins}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock size={16} />
              <span>Departs in 5m</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <CreditCard size={16} />
              <span>PHP 25-35</span>
            </div>
          </div>

          <Button fullWidth size="lg" onClick={handleStartTrip}>
            {t.results.startTrip}
          </Button>
        </div>
      </div>
    </div>
  );
};
