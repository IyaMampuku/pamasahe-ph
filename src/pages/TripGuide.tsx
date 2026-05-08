import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation, type Coordinates } from '../contexts/LocationContext';
import { getRoute, type RouteData, type NominatimResult } from '../services/api';
import { LeafletMap } from '../components/map/LeafletMap';
import { BottomSheet } from '../components/layout/BottomSheet';

export const TripGuide: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const routeLocation = useRouteLocation();
  const { location } = useLocation();
  
  const destination = routeLocation.state?.destination as NominatimResult;
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  useEffect(() => {
    if (location && destination) {
      const destCoords: Coordinates = [parseFloat(destination.lat), parseFloat(destination.lon)];
      getRoute(location, destCoords).then(data => {
        if (data) setRouteData(data);
      });
    }
  }, [location, destination]);

  if (!destination) {
    return null;
  }

  const destCoords: Coordinates = [parseFloat(destination.lat), parseFloat(destination.lon)];
  const mapCenter = location || destCoords;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 z-10 p-4 pt-6 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#1a00b2] pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="h-[40vh] w-full relative z-0">
        <LeafletMap 
          center={mapCenter} 
          markers={[{ position: mapCenter }, { position: destCoords }]}
          route={routeData?.geometry}
          zoom={13}
        />
      </div>

      <BottomSheet isOpen={true} snapPoints={[65, 85]} initialSnap={0}>
        <div className="space-y-6 pt-2 pb-20">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold text-[#1a00b2]">Trip Overview</h2>
            <span className="bg-[#f2ca4b] text-[#1a00b2] px-3 py-1 rounded-full text-sm font-bold">
              PHP 25
            </span>
          </div>

          {/* Step 1 */}
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#1a00b2] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="w-0.5 h-full bg-gray-200 my-2"></div>
            </div>
            <div className="flex-1 pb-6">
              <p className="font-bold text-lg">Jeepney to Heritage</p>
              <p className="text-gray-500 text-sm mb-3">Wait along the main road. Any jeep with "Baclaran" sign.</p>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#1a00b2]"></div>
                <div className="flex items-start space-x-3">
                  <MessageSquare size={20} className="text-[#1a00b2] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#1a00b2] uppercase tracking-wider mb-1">What to say</p>
                    <p className="font-medium">"{t.trip.bayadPrompt} Heritage."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#1a00b2] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Walk to Destination</p>
              <p className="text-gray-500 text-sm">Approx. 5 mins walk.</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/home')}
            className="w-full mt-8 bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100"
          >
            {t.trip.finish}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
