import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Crosshair, AlertCircle, ChevronsRight
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation, type Coordinates } from '../contexts/LocationContext';
import { getRoute, type RouteData, type NominatimResult } from '../services/api';
import { LeafletMap } from '../components/map/LeafletMap';
import { BottomSheet } from '../components/layout/BottomSheet';
import { splitGeometry, detectHighwayInRoute } from '../services/TransitLogic';
import type { RouteOption, RouteLeg } from '../services/TransitLogic';

// ── Style helpers ───────────────────────────────────────────────────

const VEHICLE_BG: Record<string, string> = {
  jeepney:  'bg-green-50  border-green-400/40',
  bus:      'bg-red-50    border-red-400/40',
  tricycle: 'bg-blue-50   border-blue-400/40',
  train:    'bg-yellow-50 border-yellow-400/40',
};
const VEHICLE_TEXT: Record<string, string> = {
  jeepney:  'text-green-700',
  bus:      'text-red-700',
  tricycle: 'text-blue-700',
  train:    'text-yellow-700',
};
const VEHICLE_PILL: Record<string, string> = {
  jeepney:  'bg-green-600 text-white',
  bus:      'bg-red-600   text-white',
  tricycle: 'bg-blue-600  text-white',
  train:    'bg-yellow-500 text-white',
};

// ── Leg Card Sub-component ──────────────────────────────────────────

interface LegCardProps {
  leg:      RouteLeg;
  isActive: boolean;
}

const LegCard: React.FC<LegCardProps> = ({ leg, isActive }) => {
  const bg   = VEHICLE_BG[leg.vehicle]   ?? 'bg-gray-50 border-gray-200';
  const text = VEHICLE_TEXT[leg.vehicle] ?? 'text-gray-700';
  const pill = VEHICLE_PILL[leg.vehicle] ?? 'bg-gray-600 text-white';

  return (
    <div className={`flex space-x-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
      {/* Step dot + connector */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0"
          style={{ backgroundColor: leg.color }}
        >
          {leg.step}
        </div>
        <div className="w-0.5 flex-1 mt-3" style={{ backgroundColor: leg.color + '30' }} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between mb-2 gap-3">
          <p className="font-black text-gray-800 text-base leading-snug">
            {leg.vehicleLabel} <span className="text-gray-400 font-normal">→</span>{' '}
            <span style={{ color: leg.color }}>{leg.to}</span>
          </p>
          <span className={`shrink-0 text-[11px] font-black px-2.5 py-1 rounded-full border ${
            leg.fareType === 'special'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>{leg.fareLabel}</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">{leg.from} → {leg.to}</p>

        {/* Transfer alert */}
        {leg.isTransferNode && leg.transferLabel && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl mb-4">
            <ChevronsRight size={15} className="text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-700 leading-relaxed">{leg.transferLabel}</p>
          </div>
        )}

        {/* What to Say box */}
        <div className={`${bg} border p-5 rounded-2xl relative overflow-hidden shadow-sm`}>
          <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl" style={{ backgroundColor: leg.color }} />
          <div className="flex items-start space-x-3 pl-2">
            <MessageSquare size={18} className={`${text} shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`text-[10px] font-bold ${text} uppercase tracking-wider mb-2 opacity-70`}>What to say</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pill}`}>{leg.vehicleLabel}</span>
                <p className={`font-bold ${text} text-sm leading-relaxed`}>"{leg.whatToSay}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────

export const TripGuide: React.FC = () => {
  const navigate        = useNavigate();
  const { t }           = useTranslation();
  const routeLocation   = useRouteLocation();
  const { location, locateMe } = useLocation();

  const destination      = routeLocation.state?.destination as NominatimResult | undefined;
  const selectedOption   = routeLocation.state?.selectedOption as RouteOption | undefined;

  const [routeData, setRouteData]   = useState<RouteData | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [snapIndex, setSnapIndex]   = useState(1);

  // Assign geometry paths to legs once OSRM route loads
  const [enrichedLegs, setEnrichedLegs] = useState<RouteLeg[]>(
    selectedOption?.legs ?? []
  );

  useEffect(() => {
    if (location && destination) {
      const dest: Coordinates = [parseFloat(destination.lat), parseFloat(destination.lon)];
      getRoute(location, dest).then(data => {
        if (!data) return;
        setRouteData(data);

        // Split geometry proportionally between legs
        const legs = selectedOption?.legs ?? [];
        if (legs.length > 0) {
          const ratios = legs.map((l: RouteLeg) => l.legRatio);
          const paths  = splitGeometry(data.geometry, ratios);
          setEnrichedLegs(legs.map((leg: RouteLeg, i: number) => ({ ...leg, path: paths[i] ?? [] })));
        }
      });
    }
  }, [location, destination, selectedOption]);

  if (!destination) return null;

  const destCoords: Coordinates = [parseFloat(destination.lat), parseFloat(destination.lon)];
  const mapCenter = location || destCoords;

  // Build per-leg map data
  const mapLegs = enrichedLegs.map(l => ({
    path: l.path,
    color: l.color,
    isTransferNode: l.isTransferNode,
    transferLabel: l.transferLabel,
  }));

  // Fallback: if no legs, use full route in brand color
  const hasLegs = enrichedLegs.length > 0 && enrichedLegs.some(l => l.path.length > 1);

  const totalFareMin = enrichedLegs.reduce((s, l) => s + l.fareMin, 0);
  const totalFareMax = enrichedLegs.reduce((s, l) => s + l.fareMax, 0);
  const inSubdivision = enrichedLegs.some(l => l.fareType === 'special');

  // Highway warning for map overlay: show if a tricycle-only route would cross a highway
  const hwDetect = location && destination
    ? detectHighwayInRoute(location, destCoords, destination.display_name)
    : null;
  const hwMapWarning = hwDetect?.detected
    ? `Tricycles restricted on ${hwDetect.highway?.shortName}. Switching to Jeep/Bus.`
    : undefined;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 overflow-hidden relative">

      {/* Back */}
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
          routeLegs={hasLegs ? mapLegs : undefined}
          route={!hasLegs ? routeData?.geometry : undefined}
          routeColor="#1a00b2"
          highwayWarning={hwMapWarning}
          zoom={15}
        />
      </div>


      {/* Center Button — dynamic position to avoid sheet overlap */}
      <div
        className="absolute right-6 z-10 transition-all duration-300"
        style={{ bottom: `calc(${snapIndex === 0 ? 12 : snapIndex === 1 ? 60 : 90}vh + 24px)` }}
      >
        <button
          onClick={locateMe}
          className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-lg text-[#1a00b2] border border-gray-100 active:scale-95 transition-all duration-200"
        >
          <Crosshair size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet isOpen={true} snapPoints={[12, 60, 90]} initialSnap={1} onSnapChange={setSnapIndex}>
        <div className="space-y-8 pt-4 pb-28">

          {/* ── Minimalist Header ── */}
          <div className="flex items-start justify-between px-1">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {snapIndex === 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {snapIndex === 0 ? 'Live Guide' : (selectedOption?.label.split('—')[0].trim() ?? 'Trip Plan')}
                </h2>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {selectedOption?.tagline}
              </p>
            </div>

            {/* Subtle Fare Badge */}
            <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Est. Fare</p>
              <p className="text-lg font-black text-[#1a00b2]">₱{totalFareMin} – {totalFareMax}</p>
            </div>
          </div>

          {/* ── Village Alert ── */}
          {inSubdivision && (
            <div className="bg-amber-50/50 border border-amber-200/50 p-5 rounded-[2rem] flex items-start space-x-4">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-amber-600" size={18} />
              </div>
              <p className="text-xs text-amber-800 font-bold leading-relaxed">
                Village restrictions active. Tricycle required for interior legs.
              </p>
            </div>
          )}

          {/* ── Step Tabs ── */}
          {enrichedLegs.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {enrichedLegs.map(leg => (
                <button
                  key={leg.step}
                  onClick={() => setActiveStep(leg.step)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shrink-0 transition-all duration-300 border ${
                    activeStep === leg.step
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}
                  style={activeStep === leg.step ? { backgroundColor: leg.color, borderColor: leg.color } : {}}
                >
                  <span>Step {leg.step}</span>
                  <span className="opacity-40">·</span>
                  <span>{leg.vehicleLabel}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Detailed Leg List ── */}
          <div className="space-y-2">
            {enrichedLegs.map(leg => (
              <LegCard key={leg.step} leg={leg} isActive={leg.step === activeStep} />
            ))}

            {/* Arrival Step */}
            <div className={`flex space-x-5 transition-opacity duration-300 ${activeStep === enrichedLegs.length + 1 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setActiveStep(enrichedLegs.length + 1)}
                  className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm shadow-lg shrink-0"
                >
                  {enrichedLegs.length + 1}
                </button>
              </div>
              <div className="flex-1 pb-6">
                <p className="font-black text-gray-900 text-lg">Destination reached</p>
                <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest">{destination.display_name.split(',')[0]}</p>
              </div>
            </div>
          </div>

          {/* ── Action ── */}
          <div className="pt-4">
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-[#1a00b2] text-white font-black py-5 rounded-[2rem] active:scale-95 transition-all duration-200 shadow-xl shadow-[#1a00b2]/20 text-sm uppercase tracking-[0.2em]"
            >
              {t.trip.finish}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
