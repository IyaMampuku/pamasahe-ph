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
    <div className={`flex space-x-4 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      {/* Step dot + connector */}
      <div className="flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
          style={{ backgroundColor: leg.color }}
        >
          {leg.step}
        </div>
        <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: leg.color + '40' }} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-gray-800">{leg.vehicleLabel} → <span style={{ color: leg.color }}>{leg.to}</span></p>
          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
            leg.fareType === 'special'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>{leg.fareLabel}</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">{leg.from} → {leg.to}</p>

        {/* Transfer alert */}
        {leg.isTransferNode && leg.transferLabel && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl mb-3">
            <ChevronsRight size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-700">{leg.transferLabel}</p>
          </div>
        )}

        {/* What to Say box */}
        <div className={`${bg} border p-4 rounded-2xl relative overflow-hidden shadow-sm`}>
          <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl" style={{ backgroundColor: leg.color }} />
          <div className="flex items-start space-x-3 pl-1">
            <MessageSquare size={17} className={`${text} shrink-0 mt-0.5`} />
            <div>
              <p className={`text-[10px] font-bold ${text} uppercase tracking-wider mb-1.5 opacity-80`}>What to say</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${pill}`}>{leg.vehicleLabel}</span>
                <p className={`font-bold ${text} text-sm leading-snug`}>"{leg.whatToSay}"</p>
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
          const ratios = legs.map(l => l.legRatio);
          const paths  = splitGeometry(data.geometry, ratios);
          setEnrichedLegs(legs.map((leg, i) => ({ ...leg, path: paths[i] ?? [] })));
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


      {/* Center Button (behind sheet) */}
      <div className="absolute bottom-64 right-4 z-10">
        <button
          onClick={locateMe}
          className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-2xl text-[#1a00b2] border border-gray-50 active:scale-90 transition-transform"
        >
          <Crosshair size={28} />
        </button>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet isOpen={true} snapPoints={[12, 60, 90]} initialSnap={1} onSnapChange={setSnapIndex}>
        <div className="space-y-4 pt-2 pb-24 px-2">

          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {snapIndex === 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              )}
              <div>
                <h2 className={`text-xl font-black transition-colors ${snapIndex === 0 ? 'text-green-600' : 'text-[#1a00b2]'}`}>
                  {snapIndex === 0 ? 'In Route' : (selectedOption?.label ?? 'Trip Overview')}
                </h2>
                {selectedOption && <p className="text-xs text-gray-400">{selectedOption.tagline}</p>}
              </div>
            </div>

            {/* Fare badge */}
            <span className="bg-[#f2ca4b] text-[#1a00b2] px-3 py-1 rounded-full text-sm font-black shadow-sm shrink-0">
              ₱{totalFareMin}–{totalFareMax}
            </span>
          </div>

          {/* ── Subdivision alert ── */}
          {inSubdivision && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start space-x-2">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Village zone: Jeep/Bus restricted on interior roads. Follow legs in order.
              </p>
            </div>
          )}

          {/* ── Step picker ── (if multiple legs) */}
          {enrichedLegs.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
              {enrichedLegs.map(leg => (
                <button
                  key={leg.step}
                  onClick={() => setActiveStep(leg.step)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors border ${
                    activeStep === leg.step
                      ? 'text-white border-transparent'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                  style={activeStep === leg.step ? { backgroundColor: leg.color, borderColor: leg.color } : {}}
                >
                  <span>Leg {leg.step}</span>
                  <span className="opacity-70">·</span>
                  <span>{leg.vehicleLabel}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Leg cards ── */}
          <div className="space-y-0">
            {enrichedLegs.map(leg => (
              <LegCard key={leg.step} leg={leg} isActive={leg.step === activeStep} />
            ))}
          </div>

          {/* ── Final walk step ── */}
          <div className="flex space-x-4">
            <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {enrichedLegs.length + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Walk to Destination</p>
              <p className="text-gray-400 text-sm">Arrive at {destination.display_name.split(',')[0]}.</p>
            </div>
          </div>

          {/* ── Finish ── */}
          <button
            onClick={() => navigate('/home')}
            className="w-full mt-2 bg-gray-900 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-md"
          >
            {t.trip.finish}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
