import type { Coordinates } from '../contexts/LocationContext';

// ─────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const VEHICLE_COLORS_HEX: Record<string, string> = {
  jeepney:     '#16a34a',   // Green
  bus:         '#dc2626',   // Red
  tricycle:    '#2563eb',   // Blue
  train:       '#eab308',   // Yellow
  walking:     '#6b7280',   // Gray
  recommended: '#1a00b2',   // Brand blue
};

// Speed heuristics (minutes per km)
const SPEED: Record<string, number> = {
  tricycle: 4,    // ~15 km/h
  jeepney:  2.5,  // ~24 km/h
  bus:      2,    // ~30 km/h
  train:    1.5,  // ~40 km/h
};

// ─────────────────────────────────────────────────────────────────
//  ZONE DATABASE
// ─────────────────────────────────────────────────────────────────

export type ZoneType = 'subdivision' | 'barangay' | 'main_road';

export interface SubdivisionZone {
  name: string;
  gateName: string;
  fareMin: number;
  fareMax: number;
  bounds: { lat: [number, number]; lng: [number, number] };
}

export const CONSTRAINED_ZONES: SubdivisionZone[] = [
  { name: 'BF Homes',          gateName: 'BF Homes Main Gate (Aguirre Ave.)',         fareMin: 40, fareMax: 60, bounds: { lat: [14.42, 14.46], lng: [121.0,  121.05] } },
  { name: 'Moonwalk Village',  gateName: 'Moonwalk Village Gate (Las Piñas Rd.)',      fareMin: 35, fareMax: 50, bounds: { lat: [14.48, 14.5],  lng: [121.0,  121.02] } },
  { name: 'Pilar Village',     gateName: 'Pilar Village Gate (Alabang-Zapote Rd.)',    fareMin: 35, fareMax: 50, bounds: { lat: [14.43, 14.45], lng: [120.98, 121.0]  } },
  { name: 'Sun Valley',        gateName: 'Sun Valley Gate (Quirino Ave.)',             fareMin: 40, fareMax: 60, bounds: { lat: [14.38, 14.42], lng: [121.01, 121.05] } },
  { name: 'Philips Park',      gateName: 'Philips Park Gate (Molino Rd.)',             fareMin: 30, fareMax: 50, bounds: { lat: [14.44, 14.47], lng: [120.97, 121.0]  } },
  { name: 'Tuazon Subdivision',gateName: 'Tuazon Subdivision Gate',                    fareMin: 30, fareMax: 45, bounds: { lat: [14.51, 14.55], lng: [121.0,  121.04] } },
];

// ─────────────────────────────────────────────────────────────────
//  ZONE DETECTION
// ─────────────────────────────────────────────────────────────────

export interface ZoneResult {
  type: ZoneType;
  zone?: SubdivisionZone;
}

export const getZoneResult = (coords: Coordinates, displayName = ''): ZoneResult => {
  const [lat, lng] = coords;
  for (const zone of CONSTRAINED_ZONES) {
    if (lat >= zone.bounds.lat[0] && lat <= zone.bounds.lat[1] &&
        lng >= zone.bounds.lng[0] && lng <= zone.bounds.lng[1]) {
      return { type: 'subdivision', zone };
    }
  }
  const lower = displayName.toLowerCase();
  const subdivKw = ['subdivision','village','subd.','subd','homes','estate','residences','gated','compound'];
  if (subdivKw.some(k => lower.includes(k))) {
    return { type: 'subdivision', zone: {
      name: displayName.split(',')[0],
      gateName: `${displayName.split(',')[0]} Gate`,
      fareMin: 40, fareMax: 60,
      bounds: { lat: [0,0], lng: [0,0] },
    }};
  }
  if (lower.includes('barangay') || lower.includes('brgy')) return { type: 'barangay' };
  return { type: 'main_road' };
};

// ─────────────────────────────────────────────────────────────────
//  ROAD CLASS
// ─────────────────────────────────────────────────────────────────

export type RoadClass = 'residential' | 'barangay' | 'primary' | 'highway' | 'unknown';

export const inferRoadClass = (name: string): RoadClass => {
  const l = name.toLowerCase();
  if (l.includes('highway') || l.includes('expressway')) return 'highway';
  if (l.includes('avenue') || l.includes('blvd'))        return 'primary';
  if (l.includes('barangay road') || l.includes('st.'))  return 'barangay';
  if (l.includes('interior') || l.includes('phase'))     return 'residential';
  return 'unknown';
};

export const getBannedVehiclesForRoad = (rc: RoadClass): string[] => {
  if (rc === 'residential' || rc === 'barangay') return ['bus', 'train'];
  return [];
};

// ─────────────────────────────────────────────────────────────────
//  LEG & ROUTE OPTION MODELS
// ─────────────────────────────────────────────────────────────────

export interface RouteLeg {
  step:          number;
  vehicle:       string;
  vehicleLabel:  string;
  from:          string;
  to:            string;
  path:          Coordinates[];    // filled after OSRM fetch in TripGuide
  color:         string;
  fareMin:       number;
  fareMax:       number;
  fareLabel:     string;
  fareType:      'special' | 'standard' | 'negotiable';
  whatToSay:     string;
  isTransferNode: boolean;
  transferLabel?: string;
  legRatio:      number;           // proportion of total route geometry for this leg (0–1)
}

export interface RouteOption {
  id:               'commuter' | 'express' | 'solo';
  label:            string;
  tagline:          string;
  priority:         'fare' | 'time' | 'convenience';
  legs:             RouteLeg[];
  totalFareMin:     number;
  totalFareMax:     number;
  estimatedMinutes: number;
  badge:            string;
  badgeColor:       string;
}

/** Legacy shape — kept for backwards compat with Results/TripGuide geofence alert */
export interface TransitPlan {
  legs:             RouteLeg[];
  allowedVehicles:  string[];
  startZone:        ZoneResult;
  endZone:          ZoneResult;
  suggestedFirstLeg?: string;
  fareOverride?:    string;
  advice?:          string;
}

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────

/** Haversine distance in km between two lat/lng points */
export const haversineKm = (a: Coordinates, b: Coordinates): number => {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const aa = Math.sin(dLat/2)**2 +
             Math.cos(a[0]*Math.PI/180) * Math.cos(b[0]*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
};

/** Split a flat coordinate array into N slices by ratio array (must sum ≈ 1) */
export const splitGeometry = (coords: Coordinates[], ratios: number[]): Coordinates[][] => {
  const total = coords.length;
  const result: Coordinates[][] = [];
  let pos = 0;
  for (let i = 0; i < ratios.length; i++) {
    const count = i === ratios.length - 1
      ? total - pos
      : Math.max(2, Math.round(ratios[i] * total));
    result.push(coords.slice(pos, pos + count));
    pos = Math.min(pos + count, total);
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────
//  LEG BUILDER HELPERS
// ─────────────────────────────────────────────────────────────────

const makeLeg = (
  step: number,
  vehicle: string,
  from: string,
  to: string,
  fareMin: number,
  fareMax: number,
  fareType: RouteLeg['fareType'],
  whatToSay: string,
  isTransferNode: boolean,
  legRatio: number,
  transferLabel?: string,
): RouteLeg => ({
  step,
  vehicle,
  vehicleLabel: vehicle === 'train' ? 'LRT/MRT' : vehicle.charAt(0).toUpperCase() + vehicle.slice(1),
  from, to,
  path: [],
  color: VEHICLE_COLORS_HEX[vehicle] ?? '#1a00b2',
  fareMin, fareMax,
  fareLabel: fareType === 'special' ? `₱${fareMin}–${fareMax} (Special)` : `₱${fareMin}`,
  fareType,
  whatToSay,
  isTransferNode,
  transferLabel,
  legRatio,
});

// ─────────────────────────────────────────────────────────────────
//  3-OPTION COMPARISON ENGINE
// ─────────────────────────────────────────────────────────────────

export const generateRouteOptions = (
  startCoords: Coordinates,
  endCoords:   Coordinates,
  startName:   string,
  endName:     string,
): RouteOption[] => {
  const startZone  = getZoneResult(startCoords, startName);
  const endZone    = getZoneResult(endCoords,   endName);
  const distKm     = haversineKm(startCoords, endCoords);
  const destName   = endName.split(',')[0];
  const startLabel = startName.split(',')[0];

  const startSubdiv = startZone.type === 'subdivision' ? startZone.zone! : null;
  const endSubdiv   = endZone.type   === 'subdivision' ? endZone.zone!   : null;

  // Interior tricycle legs take ~15% of route each
  const INTERIOR_RATIO = 0.15;
  const mainRatio = 1 - (startSubdiv ? INTERIOR_RATIO : 0) - (endSubdiv ? INTERIOR_RATIO : 0);

  // ── OPTION 1: Commuter Special (Tricycle + Jeepney) ──
  const commuterLegs: RouteLeg[] = [];
  if (startSubdiv) commuterLegs.push(makeLeg(
    1, 'tricycle', startLabel, startSubdiv.gateName,
    startSubdiv.fareMin, startSubdiv.fareMax, 'special',
    `Pahatid po sa ${startSubdiv.gateName}.`,
    true, INTERIOR_RATIO, `Board Jeepney at ${startSubdiv.gateName}`
  ));
  commuterLegs.push(makeLeg(
    commuterLegs.length + 1, 'jeepney',
    startSubdiv ? startSubdiv.gateName : startLabel,
    endSubdiv   ? endSubdiv.gateName   : destName,
    13, 15, 'standard',
    `Bayad po, isa hanggang ${endSubdiv ? endSubdiv.gateName : destName}.`,
    !!endSubdiv, mainRatio,
    endSubdiv ? `Switch to Tricycle at ${endSubdiv.gateName}` : undefined
  ));
  if (endSubdiv) commuterLegs.push(makeLeg(
    commuterLegs.length + 1, 'tricycle', endSubdiv.gateName, destName,
    endSubdiv.fareMin, endSubdiv.fareMax, 'special',
    `Pahatid po sa loob ng ${endSubdiv.name}, sa ${destName}.`,
    false, INTERIOR_RATIO
  ));

  const commuterFareMin = commuterLegs.reduce((s, l) => s + l.fareMin, 0);
  const commuterFareMax = commuterLegs.reduce((s, l) => s + l.fareMax, 0);
  const commuterTime    = Math.round(
    (startSubdiv ? 5 : 0) + distKm * SPEED.jeepney + (endSubdiv ? 5 : 0)
  );

  // ── OPTION 2: Express (Bus / LRT) ──
  const mainExpressVehicle = distKm > 5 ? 'train' : 'bus';
  const expressLegs: RouteLeg[] = [];
  if (startSubdiv) expressLegs.push(makeLeg(
    1, 'tricycle', startLabel, startSubdiv.gateName,
    startSubdiv.fareMin, startSubdiv.fareMax, 'special',
    `Pahatid po sa ${startSubdiv.gateName}.`,
    true, INTERIOR_RATIO, `Board ${mainExpressVehicle === 'train' ? 'LRT/MRT' : 'Bus'} at ${startSubdiv.gateName}`
  ));
  const expressFareMainMin = mainExpressVehicle === 'train' ? 15 : 15;
  const expressFareMainMax = mainExpressVehicle === 'train' ? 30 : 25;
  expressLegs.push(makeLeg(
    expressLegs.length + 1, mainExpressVehicle,
    startSubdiv ? startSubdiv.gateName : startLabel,
    endSubdiv   ? endSubdiv.gateName   : destName,
    expressFareMainMin, expressFareMainMax, 'standard',
    `Bayad po, isa hanggang ${endSubdiv ? endSubdiv.gateName : destName}.`,
    !!endSubdiv, mainRatio,
    endSubdiv ? `Switch to Tricycle at ${endSubdiv.gateName}` : undefined
  ));
  if (endSubdiv) expressLegs.push(makeLeg(
    expressLegs.length + 1, 'tricycle', endSubdiv.gateName, destName,
    endSubdiv.fareMin, endSubdiv.fareMax, 'special',
    `Pahatid po sa loob ng ${endSubdiv.name}, sa ${destName}.`,
    false, INTERIOR_RATIO
  ));

  const expressFareMin = expressLegs.reduce((s, l) => s + l.fareMin, 0);
  const expressFareMax = expressLegs.reduce((s, l) => s + l.fareMax, 0);
  const expressTime    = Math.round(
    (startSubdiv ? 4 : 0) + distKm * SPEED[mainExpressVehicle] + (endSubdiv ? 5 : 0)
  );

  // ── OPTION 3: Solo/Special (All-Tricycle) ──
  const soloBaseMin = Math.round(distKm * 12) + (startSubdiv?.fareMin ?? 0) + (endSubdiv?.fareMin ?? 0);
  const soloBaseMax = soloBaseMin + 40;
  const soloLegs: RouteLeg[] = [makeLeg(
    1, 'tricycle', startLabel, destName,
    Math.max(soloBaseMin, 50), soloBaseMax + 10, 'special',
    `Pahatid po sa ${destName}. Special trip.`,
    false, 1.0
  )];
  const soloFareMin = soloLegs[0].fareMin;
  const soloFareMax = soloLegs[0].fareMax;
  const soloTime    = Math.round(distKm * SPEED.tricycle + (startSubdiv ? 5 : 0));

  return [
    {
      id:               'commuter',
      label:            'The Commuter Special',
      tagline:          commuterLegs.map(l => l.vehicleLabel).join(' + '),
      priority:         'fare',
      legs:             commuterLegs,
      totalFareMin:     commuterFareMin,
      totalFareMax:     commuterFareMax,
      estimatedMinutes: commuterTime,
      badge:            'CHEAPEST',
      badgeColor:       'bg-green-100 text-green-700 border-green-300',
    },
    {
      id:               'express',
      label:            'The Express',
      tagline:          expressLegs.map(l => l.vehicleLabel).join(' + '),
      priority:         'time',
      legs:             expressLegs,
      totalFareMin:     expressFareMin,
      totalFareMax:     expressFareMax,
      estimatedMinutes: expressTime,
      badge:            'FASTEST',
      badgeColor:       'bg-blue-100 text-blue-700 border-blue-300',
    },
    {
      id:               'solo',
      label:            'The Solo/Special',
      tagline:          'All-Tricycle • Door to Door',
      priority:         'convenience',
      legs:             soloLegs,
      totalFareMin:     soloFareMin,
      totalFareMax:     soloFareMax,
      estimatedMinutes: soloTime,
      badge:            'CONVENIENT',
      badgeColor:       'bg-purple-100 text-purple-700 border-purple-300',
    },
  ];
};

// ─────────────────────────────────────────────────────────────────
//  LEGACY getTransitPlan — kept so Results.tsx still compiles
// ─────────────────────────────────────────────────────────────────

export const getTransitPlan = (
  start:     Coordinates,
  end:       Coordinates,
  startName: string,
  endName:   string,
): TransitPlan => {
  const options    = generateRouteOptions(start, end, startName, endName);
  const commuter   = options[0]; // Use commuter option for legacy plan
  const startZone  = getZoneResult(start, startName);
  const endZone    = getZoneResult(end,   endName);
  const startSubdiv = startZone.zone;

  return {
    legs:            commuter.legs,
    allowedVehicles: startZone.type === 'subdivision'
      ? ['tricycle']
      : ['jeepney','bus','train','tricycle'],
    startZone,
    endZone,
    suggestedFirstLeg: startSubdiv
      ? `Mag-tricycle hanggang ${startSubdiv.gateName}`
      : undefined,
    fareOverride: startSubdiv
      ? `₱${startSubdiv.fareMin}–${startSubdiv.fareMax} (Special)`
      : undefined,
    advice: startZone.type === 'subdivision'
      ? `Private Village: Jeep/Bus restricted inside ${startSubdiv?.name}. Take Tricycle to the gate first.`
      : 'High accessibility: All transport modes available.',
  };
};
