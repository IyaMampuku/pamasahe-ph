import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Truck, Bus, Train, Bike, Star, Crosshair } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation, type Coordinates } from '../contexts/LocationContext';
import { getRoute, type RouteData, type NominatimResult } from '../services/api';
import { LeafletMap } from '../components/map/LeafletMap';
import { BottomSheet } from '../components/layout/BottomSheet';

type VehicleType = 'jeepney' | 'bus' | 'train' | 'tricycle' | null;
type FareType = 'regular' | 'discounted';

const VEHICLE_COLORS: Record<string, string> = {
  jeepney: '#16a34a',
  bus: '#dc2626',
  tricycle: '#2563eb',
  train: '#eab308',
  recommended: '#1a00b2'
};

const VEHICLES = [
  { id: 'recommended', label: 'Recommended', icon: Star, color: 'bg-[#1a00b2]', text: 'text-[#1a00b2]', bg: 'bg-blue-50', pill: 'bg-[#1a00b2] text-white' },
  { id: 'jeepney', label: 'Jeepney', icon: Truck, color: 'bg-green-600', text: 'text-green-600', bg: 'bg-green-50', pill: 'bg-green-600 text-white' },
  { id: 'bus', label: 'Bus', icon: Bus, color: 'bg-red-600', text: 'text-red-600', bg: 'bg-red-50', pill: 'bg-red-600 text-white' },
  { id: 'train', label: 'LRT/MRT', icon: Train, color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50', pill: 'bg-yellow-500 text-white' },
  { id: 'tricycle', label: 'Tricycle', icon: Bike, color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50', pill: 'bg-blue-600 text-white' },
];

const FARES: Record<string, number> = {
  jeepney: 13,
  bus: 15,
  train: 20,
  tricycle: 25,
  recommended: 13
};

export const TripGuide: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const routeLocation = useRouteLocation();
  const { location, locateMe } = useLocation();
  
  const destination = routeLocation.state?.destination as NominatimResult;
  const transitPlan = routeLocation.state?.transitPlan;
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [snapIndex, setSnapIndex] = useState(1);
  
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(null);
  const [fareType, setFareType] = useState<FareType>('regular');

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
  const destName = destination.display_name.split(',')[0];

  const activeVehicleId = selectedVehicle || 'recommended';
  const baseFare = FARES[activeVehicleId];
  const currentFare = fareType === 'regular' ? baseFare : Math.round(baseFare * 0.8);
  const activeVehicleConfig = VEHICLES.find(v => v.id === activeVehicleId)!;

  const vehicleName = selectedVehicle === null ? 'Jeepney' : activeVehicleConfig.label;
  const routeColor = VEHICLE_COLORS[activeVehicleId];

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

      <div className="h-full w-full relative z-0">
        <LeafletMap 
          center={mapCenter} 
          markers={[{ position: mapCenter }, { position: destCoords }]}
          route={routeData?.geometry}
          routeColor={routeColor}
          zoom={15}
        />
      </div>

      {/* Floating Center Button */}
      <div className="absolute bottom-64 right-4 z-[90]">
        <button 
          onClick={locateMe}
          className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-2xl text-[#1a00b2] border border-gray-50 active:scale-90 transition-transform"
        >
          <Crosshair size={28} />
        </button>
      </div>

      <BottomSheet 
        isOpen={true} 
        snapPoints={[12, 65, 85]} 
        initialSnap={1}
        onSnapChange={setSnapIndex}
      >
        <div className="space-y-6 pt-2 pb-20 px-2">
          
          {/* Route Filter (Horizontal Scroll) */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 border-b border-gray-100">
            {VEHICLES.map(v => {
              const isSelected = (selectedVehicle === null && v.id === 'recommended') || selectedVehicle === v.id;
              return (
                <button 
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id === 'recommended' ? null : v.id as VehicleType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors shrink-0 ${
                    isSelected
                      ? `${v.color} text-white border-transparent`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <v.icon size={16} />
                  <span className="text-sm font-bold">{v.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {snapIndex === 0 && (
                <div className="flex items-center space-x-1.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
              <h2 className={`text-xl font-bold transition-colors duration-300 ${snapIndex === 0 ? 'text-green-600' : 'text-[#1a00b2]'}`}>
                {snapIndex === 0 ? 'In Route' : 'Trip Overview'}
              </h2>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="bg-[#f2ca4b] text-[#1a00b2] px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {activeVehicleId === 'tricycle' && transitPlan?.fareOverride 
                  ? transitPlan.fareOverride 
                  : `₱${currentFare}`}
              </span>
              
              {/* Fare Engine Tabs */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg mt-2 shadow-inner border border-gray-200/50">
                <button 
                  onClick={() => setFareType('regular')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${fareType === 'regular' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                >
                  Regular
                </button>
                <button 
                  onClick={() => setFareType('discounted')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${fareType === 'discounted' ? 'bg-white shadow text-[#1a00b2]' : 'text-gray-500'}`}
                >
                  Discounted
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Trip Card - Step 1 */}
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${activeVehicleConfig.color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                <activeVehicleConfig.icon size={16} />
              </div>
              <div className="w-0.5 h-full bg-gray-200 my-2"></div>
            </div>
            <div className="flex-1 pb-6">
              <p className="font-bold text-lg text-gray-800">{vehicleName} to {destName}</p>
              <p className="text-gray-500 text-sm mb-3">
                {activeVehicleId === 'tricycle' && transitPlan?.suggestedFirstLeg 
                  ? transitPlan.suggestedFirstLeg 
                  : `Wait along the main road. Take the ${vehicleName} route.`}
              </p>
              
              <div className={`${activeVehicleConfig.bg} border border-gray-100 p-4 rounded-2xl relative overflow-hidden shadow-sm`}>
                <div className={`absolute top-0 left-0 w-1.5 h-full ${activeVehicleConfig.color}`}></div>
                <div className="flex items-start space-x-3">
                  <MessageSquare size={20} className={`${activeVehicleConfig.text} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-[10px] font-bold ${activeVehicleConfig.text} uppercase tracking-wider mb-1 opacity-80`}>What to say</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${activeVehicleConfig.pill}`}>
                        {vehicleName}
                      </span>
                      <p className={`font-bold ${activeVehicleConfig.text} text-sm`}>"{t.trip.bayadPrompt} {destName}."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                2
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-gray-800">Walk to Destination</p>
              <p className="text-gray-500 text-sm">Arrive at {destName}.</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/home')}
            className="w-full mt-8 bg-gray-900 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-md"
          >
            {t.trip.finish}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
