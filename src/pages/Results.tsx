import React, { useMemo } from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CreditCard, AlertCircle, ChevronRight, Bike, Truck, Bus, Train } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation } from '../contexts/LocationContext';
import { generateRouteOptions, detectHighwayInRoute } from '../services/TransitLogic';
import type { RouteOption, RouteLeg } from '../services/TransitLogic';
import type { NominatimResult } from '../services/api';

// ── Vehicle icon map ────────────────────────────────────────────────
const VEHICLE_ICONS: Record<string, React.ElementType> = {
  jeepney:  Truck,
  bus:      Bus,
  train:    Train,
  tricycle: Bike,
};

// ── Small "vehicle chain" pill row ──────────────────────────────────
const LegChain: React.FC<{ legs: RouteLeg[] }> = ({ legs }) => (
  <div className="flex items-center space-x-2 flex-wrap">
    {legs.map((leg, i) => {
      const Icon = VEHICLE_ICONS[leg.vehicle] ?? Truck;
      return (
        <React.Fragment key={i}>
          <div className="flex items-center space-x-1.5 py-1 text-gray-500 font-bold">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: leg.color }}>
              <Icon size={12} />
            </div>
            <span className="text-[11px] tracking-tight">{leg.vehicleLabel}</span>
          </div>
          {i < legs.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Route Option Card ───────────────────────────────────────────────
interface OptionCardProps {
  option:    RouteOption;
  isTop?:    boolean;
  onSelect:  (opt: RouteOption) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, isTop, onSelect }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`bg-white p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-300 border-2 ${
        isTop
          ? 'border-[#1a00b2] shadow-md'
          : 'border-white hover:border-gray-100'
      }`}
      onClick={() => onSelect(option)}
    >
      {/* Badge */}
      {option.badge && (
        <span className={`absolute top-0 right-0 text-[9px] font-black px-5 py-2 rounded-bl-[1.5rem] uppercase tracking-[0.15em] ${option.badgeColor}`}>
          {option.badge}
        </span>
      )}

      {/* Title row */}
      <div className="flex justify-between items-start mb-5 pr-16">
        <div>
          <p className="font-black text-gray-900 text-xl tracking-tight leading-tight">{option.label}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1.5">
            {option.tagline}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-2xl text-[#1a00b2]">{option.estimatedMinutes}m</p>
        </div>
      </div>

      {/* Vehicle chain pills */}
      <div className="bg-gray-50/50 p-3 rounded-2xl mb-5">
        <LegChain legs={option.legs} />
      </div>

      {/* Fare Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-black text-gray-700 bg-gray-100/50 px-4 py-2 rounded-2xl">
          <CreditCard size={15} className="text-[#1a00b2]" />
          <span>₱{option.totalFareMin} – {option.totalFareMax}</span>
        </div>
        
        <div className="flex items-center text-[#1a00b2] font-black text-xs space-x-1.5 opacity-80 hover:opacity-100 transition-opacity">
          <span>{t.results.startTrip}</span>
          <ChevronRight size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────
export const Results: React.FC = () => {
  const navigate       = useNavigate();
  const routeLocation  = useRouteLocation();
  const { location: userCoords } = useLocation();

  const destination = routeLocation.state?.destination as NominatimResult | undefined;

  // Generate 3 route options from engine
  const routeOptions = useMemo<RouteOption[]>(() => {
    if (!userCoords || !destination) return [];
    return generateRouteOptions(
      userCoords,
      [parseFloat(destination.lat), parseFloat(destination.lon)],
      'Your Location',
      destination.display_name,
    );
  }, [userCoords, destination]);

  const hwDetect = useMemo(() => {
    if (!userCoords || !destination) return null;
    return detectHighwayInRoute(
      userCoords,
      [parseFloat(destination.lat), parseFloat(destination.lon)],
      destination.display_name,
    );
  }, [userCoords, destination]);

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50 p-6">
        <AlertCircle size={40} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium mb-4">No destination selected.</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-[#1a00b2] text-white font-bold px-6 py-3 rounded-2xl shadow-lg"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const handleSelect = (opt: RouteOption) => {
    navigate('/trip', { state: { destination, selectedOption: opt } });
  };

  const destName = destination.display_name.split(',')[0];
  const hasSubdivision = routeOptions[0]?.legs.some(l => l.fareType === 'special');

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-10 shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 active:scale-95 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Trip Options</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
          <div className="w-10 h-10 bg-[#1a00b2]/10 rounded-2xl flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-[#1a00b2]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">To Destination</p>
            <p className="font-black text-gray-800 truncate leading-tight">{destName}</p>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 overflow-y-auto no-scrollbar -mt-4 px-4 pt-6 pb-32 space-y-5 relative">
        {/* Highway restriction alert */}
          {hwDetect?.detected && (
            <div className="bg-red-50 border-2 border-red-100 p-5 rounded-[2rem] flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-1">
                  Highway Restricted
                </p>
                <p className="text-sm text-red-800 font-bold leading-snug">
                  Tricycles are not allowed on {hwDetect.highway?.shortName}.
                </p>
                <p className="text-xs text-red-700/70 mt-2 font-medium">
                  Routes below automatically include required Jeep/Bus transfers.
                </p>
              </div>
            </div>
          )}

          {/* Subdivision alert */}
          {hasSubdivision && (
          <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-[2rem] flex items-start space-x-4">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-lg">🏘️</span>
            </div>
            <div>
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-1">
                Subdivision Zone
              </p>
              <p className="text-sm text-amber-800 font-bold leading-snug">
                Gated area detected. Tricycle required for the first/last mile.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suggested Routes</p>
          <div className="h-px bg-gray-200 flex-1 ml-4" />
        </div>

        {routeOptions.map((opt, i) => (
          <OptionCard key={opt.id} option={opt} isTop={i === 0} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};
