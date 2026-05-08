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
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
          {t.results.recommended}
        </h2>
        
        <div className="space-y-4 pb-20">
          {/* Option 1: Recommended */}
          <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-[#1a00b2]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#f2ca4b] text-[#1a00b2] text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">BEST MATCH</div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#1a00b2] rounded-xl flex items-center justify-center text-white shadow-sm">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">Jeepney + Bus</p>
                  <p className="text-xs font-medium text-gray-500">2 transfers • Fastest</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-xl text-[#1a00b2]">35 {t.results.mins}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <Clock size={14} />
                <span>Departs in 5m</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                <CreditCard size={14} />
                <span>PHP 25-35</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleStartTrip} className="shadow-lg active:scale-95 transition-transform">
              {t.results.startTrip}
            </Button>
          </div>

          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1 mt-6">
            Other Options
          </h2>

          {/* Option 2: Bus Only */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:border-red-200 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Bus Only</p>
                  <p className="text-xs font-medium text-gray-500">Direct route • Air-conditioned</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">45 {t.results.mins}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500">PHP 40</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Expect Traffic</span>
              </div>
              <button onClick={handleStartTrip} className="text-xs font-bold text-[#1a00b2] hover:underline px-2 py-1">View Route</button>
            </div>
          </div>

          {/* Option 3: Jeepney Only */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Jeepney Only</p>
                  <p className="text-xs font-medium text-gray-500">1 transfer • Most affordable</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">55 {t.results.mins}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500">PHP 13</span>
              </div>
              <button onClick={handleStartTrip} className="text-xs font-bold text-[#1a00b2] hover:underline px-2 py-1">View Route</button>
            </div>
          </div>

          {/* Option 4: Tricycle */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Navigation size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Tricycle Special</p>
                  <p className="text-xs font-medium text-gray-500">Direct drop-off • Inner streets</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">30 {t.results.mins}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500">PHP 60+</span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Negotiable</span>
              </div>
              <button onClick={handleStartTrip} className="text-xs font-bold text-[#1a00b2] hover:underline px-2 py-1">View Route</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
