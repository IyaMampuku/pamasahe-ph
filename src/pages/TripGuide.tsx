import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Truck, Bus, Train, Bike, Star, Crosshair, MapPin, AlertCircle
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation, type Coordinates } from '../contexts/LocationContext';
import { getRoute, type RouteData, type NominatimResult } from '../services/api';
import { LeafletMap } from '../components/map/LeafletMap';
import { BottomSheet } from '../components/layout/BottomSheet';
import type { TransitPlan, RouteLeg } from '../services/TransitLogic';

type VehicleType = 'jeepney' | 'bus' | 'train' | 'tricycle' | null;
type FareType = 'regular' | 'discounted';

// ─── Color / Style Maps ────────────────────────────────────────────────────────

const VEHICLE_COLORS: Record<string, string> = {
  jeepney: '#16a34a',
  bus:     '#dc2626',
  tricycle:'#2563eb',
  train:   '#eab308',
  recommended: '#1a00b2',
};

const VEHICLE_STYLES: Record<string, {
  icon: React.ElementType;
  color: string; text: string; bg: string; pill: string; border: string;
}> = {
  recommended: { icon: Star,  color: 'bg-[#1a00b2]', text: 'text-[#1a00b2]', bg: 'bg-blue-50',   pill: 'bg-[#1a00b2] text-white', border: 'border-[#1a00b2]' },
  jeepney:     { icon: Truck, color: 'bg-green-600',  text: 'text-green-600',  bg: 'bg-green-50',  pill: 'bg-green-600 text-white',  border: 'border-green-400' },
  bus:         { icon: Bus,   color: 'bg-red-600',    text: 'text-red-600',    bg: 'bg-red-50',    pill: 'bg-red-600 text-white',    border: 'border-red-400' },
  train:       { icon: Train, color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50', pill: 'bg-yellow-500 text-white',  border: 'border-yellow-400' },
  tricycle:    { icon: Bike,  color: 'bg-blue-600',   text: 'text-blue-600',   bg: 'bg-blue-50',   pill: 'bg-blue-600 text-white',   border: 'border-blue-400' },
};

const BASE_FARES: Record<string, number> = {
  jeepney: 13, bus: 15, train: 20, tricycle: 25, recommended: 13,
};

const ALL_VEHICLES = ['recommended', 'jeepney', 'bus', 'train', 'tricycle'];

// ─── Sub-components ────────────────────────────────────────────────────────────

const LegCard: React.FC<{ leg: RouteLeg }> = ({ leg }) => {
  const style = VEHICLE_STYLES[leg.vehicle] ?? VEHICLE_STYLES.recommended;
  const Icon = style.icon;
  return (
    <div className="flex space-x-4">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full ${style.color} text-white flex items-center justify-center shadow-sm shrink-0`}>
          <Icon size={18} />
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 my-2" />
      </div>
      <div className="flex-1 pb-6">
        {/* Leg header */}
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-base text-gray-800">
            {leg.vehicleLabel} → <span className="text-[#1a00b2]">{leg.to}</span>
          </p>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
            leg.fareType === 'special'
              ? 'bg-amber-100 text-amber-700 border border-amber-300'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {leg.fareLabel}
          </span>
        </div>
        <p className="text-gray-400 text-xs mb-3">{leg.from} → {leg.to}</p>

        {/* What to Say */}
        <div className={`${style.bg} border ${style.border}/30 p-4 rounded-2xl relative overflow-hidden shadow-sm`}>
          <div className={`absolute top-0 left-0 w-1.5 h-full ${style.color}`} />
          <div className="flex items-start space-x-3 pl-1">
            <MessageSquare size={18} className={`${style.text} shrink-0 mt-0.5`} />
            <div>
              <p className={`text-[10px] font-bold ${style.text} uppercase tracking-wider mb-1 opacity-80`}>What to say</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${style.pill}`}>{leg.vehicleLabel}</span>
                <p className={`font-bold ${style.text} text-sm leading-snug`}>"{leg.whatToSay}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export const TripGuide: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const routeLocation = useRouteLocation();
  const { location, locateMe } = useLocation();

  const destination  = routeLocation.state?.destination as NominatimResult;
  const transitPlan  = routeLocation.state?.transitPlan as TransitPlan | undefined;

  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [snapIndex, setSnapIndex] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(null);
  const [fareType, setFareType] = useState<FareType>('regular');

  useEffect(() => {
    if (location && destination) {
      const destCoords: Coordinates = [parseFloat(destination.lat), parseFloat(destination.lon)];
      getRoute(location, destCoords).then(data => { if (data) setRouteData(data); });
    }
  }, [location, destination]);

  if (!destination) return null;

  const destCoords: Coordinates = [parseFloat(destination.lat), parseFloat(destination.lon)];
  const mapCenter  = location || destCoords;
  const destName   = destination.display_name.split(',')[0];

  // Active vehicle for map colour / filter
  const activeVehicleId = selectedVehicle || 'recommended';
  const routeColor      = VEHICLE_COLORS[activeVehicleId];
  const activeStyle     = VEHICLE_STYLES[activeVehicleId];
  const ActiveIcon      = activeStyle.icon;

  // Fare display (respect subdivision special fare override on first leg)
  const isSubdivisionStart = transitPlan?.startZone?.type === 'subdivision';
  const baseFare     = BASE_FARES[activeVehicleId];
  const computedFare = fareType === 'regular' ? baseFare : Math.round(baseFare * 0.8);
  const displayFare  = isSubdivisionStart && activeVehicleId === 'tricycle' && transitPlan?.fareOverride
    ? transitPlan.fareOverride
    : `₱${computedFare}`;

  // Allowed vehicles for filter bar (respect geo-restrictions)
  const allowedVehicles = transitPlan?.allowedVehicles ?? ALL_VEHICLES;

  // Multi-leg route for subdivision start
  const hasLegs = transitPlan && transitPlan.legs && transitPlan.legs.length > 0;

  // Simple single-leg "What to Say" (non-subdivision case)
  const activeVehicleLabel = activeVehicleId === 'recommended' ? 'Jeepney'
    : activeVehicleId.charAt(0).toUpperCase() + activeVehicleId.slice(1);
  const simpleWhatToSay = isSubdivisionStart && transitPlan?.legs[0]
    ? transitPlan.legs[0].whatToSay
    : `${t.trip.bayadPrompt} ${destName}.`;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 overflow-hidden relative">

      {/* Back button */}
      <div className="absolute top-0 inset-x-0 z-10 p-4 pt-6 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#1a00b2] pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Map */}
      <div className="h-full w-full relative z-0">
        <LeafletMap
          center={mapCenter}
          markers={[{ position: mapCenter }, { position: destCoords }]}
          route={routeData?.geometry}
          routeColor={routeColor}
          zoom={15}
        />
      </div>

      {/* Floating Center Button (behind sheet) */}
      <div className="absolute bottom-64 right-4 z-10">
        <button
          onClick={locateMe}
          className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-2xl text-[#1a00b2] border border-gray-50 active:scale-90 transition-transform"
        >
          <Crosshair size={28} />
        </button>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet isOpen={true} snapPoints={[12, 65, 90]} initialSnap={1} onSnapChange={setSnapIndex}>
        <div className="space-y-5 pt-2 pb-24 px-2">

          {/* ── Vehicle Filter Bar ── */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 border-b border-gray-100">
            {ALL_VEHICLES.map(vid => {
              const s      = VEHICLE_STYLES[vid];
              const Icon   = s.icon;
              const label  = vid === 'recommended' ? 'Recommended' : vid.charAt(0).toUpperCase() + vid.slice(1);
              const isSelected = (selectedVehicle === null && vid === 'recommended') || selectedVehicle === vid;
              const isBlocked  = !allowedVehicles.includes(vid) && vid !== 'recommended';
              return (
                <button
                  key={vid}
                  disabled={isBlocked}
                  onClick={() => setSelectedVehicle(vid === 'recommended' ? null : vid as VehicleType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all shrink-0 ${
                    isBlocked
                      ? 'bg-gray-100 border-gray-200 text-gray-300 line-through cursor-not-allowed opacity-60'
                      : isSelected
                      ? `${s.color} text-white border-transparent`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-bold">{vid === 'train' ? 'LRT/MRT' : label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Header Row ── */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {snapIndex === 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              )}
              <h2 className={`text-xl font-bold transition-colors duration-300 ${snapIndex === 0 ? 'text-green-600' : 'text-[#1a00b2]'}`}>
                {snapIndex === 0 ? 'In Route' : 'Trip Overview'}
              </h2>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="bg-[#f2ca4b] text-[#1a00b2] px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {displayFare}
              </span>
              {/* Fare type toggle — hidden when fare is a forced special */}
              {!isSubdivisionStart && (
                <div className="flex bg-gray-100 p-0.5 rounded-lg shadow-inner border border-gray-200/50">
                  {(['regular', 'discounted'] as FareType[]).map(ft => (
                    <button
                      key={ft}
                      onClick={() => setFareType(ft)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${fareType === ft ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                      {ft.charAt(0).toUpperCase() + ft.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Subdivision Alert ── */}
          {transitPlan?.advice && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1">Transit Restriction</p>
                <p className="text-sm text-amber-700 font-medium leading-relaxed">{transitPlan.advice}</p>
              </div>
            </div>
          )}

          {/* ── MULTI-LEG PLAN (subdivision routes) ── */}
          {hasLegs ? (
            <div className="space-y-1">
              {/* Leg 0: current position marker */}
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-gray-500" />
                </div>
                <p className="text-sm font-bold text-gray-500">Your Location (Inside Village)</p>
              </div>

              {transitPlan!.legs.map(leg => <LegCard key={leg.step} leg={leg} />)}

              {/* Final walk step */}
              <div className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {transitPlan!.legs.length + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base text-gray-800">Walk to Destination</p>
                  <p className="text-gray-500 text-sm">Arrive at {destName}.</p>
                </div>
              </div>
            </div>

          ) : (
            /* ── SINGLE-LEG PLAN (standard routes) ── */
            <div className="flex space-x-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full ${activeStyle.color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  <ActiveIcon size={16} />
                </div>
                <div className="w-0.5 flex-1 bg-gray-200 my-2" />
              </div>
              <div className="flex-1 pb-6">
                <p className="font-bold text-lg text-gray-800">
                  {activeVehicleLabel} to {destName}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  {transitPlan?.suggestedFirstLeg ?? `Wait along the main road.`}
                </p>

                <div className={`${activeStyle.bg} border ${activeStyle.border}/30 p-4 rounded-2xl relative overflow-hidden shadow-sm`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${activeStyle.color}`} />
                  <div className="flex items-start space-x-3 pl-1">
                    <MessageSquare size={18} className={`${activeStyle.text} shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-[10px] font-bold ${activeStyle.text} uppercase tracking-wider mb-1 opacity-80`}>What to say</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${activeStyle.pill}`}>
                          {activeVehicleLabel}
                        </span>
                        <p className={`font-bold ${activeStyle.text} text-sm`}>"{simpleWhatToSay}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Walk to Destination (single-leg only) ── */}
          {!hasLegs && (
            <div className="flex space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">2</div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-gray-800">Walk to Destination</p>
                <p className="text-gray-500 text-sm">Arrive at {destName}.</p>
              </div>
            </div>
          )}

          {/* ── Finish Button ── */}
          <button
            onClick={() => navigate('/home')}
            className="w-full mt-4 bg-gray-900 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-md"
          >
            {t.trip.finish}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
