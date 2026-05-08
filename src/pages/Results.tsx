import React, { useMemo } from 'react';
import { useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CreditCard, AlertCircle, ChevronRight, Bike, Truck, Bus, Train } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useLocation } from '../contexts/LocationContext';
import { generateRouteOptions } from '../services/TransitLogic';
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
  <div className="flex items-center space-x-1 flex-wrap">
    {legs.map((leg, i) => {
      const Icon = VEHICLE_ICONS[leg.vehicle] ?? Truck;
      return (
        <React.Fragment key={i}>
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
            style={{ backgroundColor: leg.color }}>
            <Icon size={10} />
            <span>{leg.vehicleLabel}</span>
          </div>
          {i < legs.length - 1 && <ChevronRight size={12} className="text-gray-400" />}
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
      className={`bg-white p-5 rounded-3xl shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${
        isTop
          ? 'border-2 border-[#1a00b2]/30 shadow-lg'
          : 'border border-gray-100 hover:border-gray-200'
      }`}
      onClick={() => onSelect(option)}
    >
      {/* Badge */}
      <span className={`absolute top-0 right-0 text-[10px] font-black px-3 py-1 rounded-bl-xl border ${option.badgeColor}`}>
        {option.badge}
      </span>

      {/* Title row */}
      <div className="flex justify-between items-start mb-3 pr-14">
        <div>
          <p className="font-black text-gray-900 text-base leading-tight">{option.label}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{option.tagline}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="font-black text-xl text-[#1a00b2]">{option.estimatedMinutes} {t.results.mins}</p>
        </div>
      </div>

      {/* Vehicle chain pills */}
      <LegChain legs={option.legs} />

      {/* Fare + CTA row */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
            <CreditCard size={13} />
            <span>₱{option.totalFareMin}–{option.totalFareMax}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            <Clock size={13} />
            <span>~{option.estimatedMinutes}m</span>
          </div>
        </div>
        <button className="text-xs font-black text-[#1a00b2] bg-[#1a00b2]/10 hover:bg-[#1a00b2]/20 px-3 py-1.5 rounded-xl transition-colors">
          {t.results.startTrip}
        </button>
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

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50 p-6">
        <AlertCircle size={40} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium mb-4">No destination selected.</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-[#1a00b2] text-white font-bold px-6 py-3 rounded-2xl"
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
      <div className="bg-[#1a00b2] p-4 pt-6 text-white pb-10 shrink-0">
        <div className="flex items-center space-x-3 mb-5">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black">Route Options</h1>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl">
          <MapPin size={22} className="text-[#f2ca4b] shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs text-blue-200 font-medium">Destination</p>
            <p className="font-bold truncate">{destName}</p>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 overflow-y-auto no-scrollbar -mt-5 px-4 pt-4 pb-24 space-y-4">
        {/* Subdivision alert (only if relevant) */}
          {hasSubdivision && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1">
                Village Zone Detected
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Route starts or ends inside a gated community. A <strong>Tricycle</strong> is required for the first/last mile. Jeep and Bus are restricted on interior roads.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Choose your route</p>

        {routeOptions.map((opt, i) => (
          <OptionCard key={opt.id} option={opt} isTop={i === 0} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};
