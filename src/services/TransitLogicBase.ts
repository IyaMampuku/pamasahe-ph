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
//  HIGHWAY DETECTION
// ─────────────────────────────────────────────────────────────────

export type HighwayClass = 'national_highway' | 'primary' | 'trunk' | 'motorway';

export interface HighwayCorridor {
  name:      string;
  shortName: string;
  type:      HighwayClass;
  bounds:    { lat: [number, number]; lng: [number, number] };
}

export interface HighwayDetection {
  detected:     boolean;
  highway?:     HighwayCorridor;
  kantoLabel:   string;
  kantoAdvice:  string;
}

export const HIGHWAY_CORRIDORS: HighwayCorridor[] = [
  { name: 'EDSA (Epifanio de los Santos Ave.)',      shortName: 'EDSA',                type: 'trunk',            bounds: { lat: [14.50, 14.72], lng: [121.03, 121.07] } },
  { name: 'South Luzon Expressway (SLEX)',            shortName: 'SLEX',                type: 'motorway',         bounds: { lat: [14.28, 14.56], lng: [121.03, 121.10] } },
  { name: 'Alabang-Zapote Road',                      shortName: 'Alabang-Zapote Rd.',  type: 'national_highway', bounds: { lat: [14.39, 14.48], lng: [120.97, 121.03] } },
  { name: 'Dr. A. Santos Avenue (Sucat Road)',        shortName: 'Dr. A. Santos Ave.',  type: 'primary',          bounds: { lat: [14.47, 14.53], lng: [120.97, 121.07] } },
  { name: 'Marcos Alvarez Avenue',                    shortName: 'Marcos Alvarez Ave.', type: 'primary',          bounds: { lat: [14.42, 14.47], lng: [120.96, 121.01] } },
  { name: 'Aguirre Avenue',                           shortName: 'Aguirre Ave.',        type: 'primary',          bounds: { lat: [14.41, 14.46], lng: [121.01, 121.05] } },
  { name: 'Quirino Avenue',                           shortName: 'Quirino Ave.',        type: 'primary',          bounds: { lat: [14.36, 14.43], lng: [121.01, 121.07] } },
  { name: 'Coastal Road (Manila-Cavite Expressway)',  shortName: 'Coastal Road',        type: 'primary',          bounds: { lat: [14.33, 14.57], lng: [120.95, 120.99] } },
  { name: 'Molino Boulevard',                         shortName: 'Molino Blvd.',        type: 'primary',          bounds: { lat: [14.38, 14.45], lng: [120.96, 121.03] } },
  { name: 'C5 Road (C. P. Garcia Avenue)',            shortName: 'C5 Road',             type: 'primary',          bounds: { lat: [14.53, 14.70], lng: [121.07, 121.10] } },
  { name: 'Macapagal Boulevard',                      shortName: 'Macapagal Blvd.',     type: 'primary',          bounds: { lat: [14.52, 14.56], lng: [120.98, 121.02] } },
  { name: 'Commonwealth Avenue',                      shortName: 'Commonwealth Ave.',   type: 'primary',          bounds: { lat: [14.64, 14.75], lng: [121.04, 121.06] } },
];

export const detectHighwayInRoute = (start: Coordinates, end: Coordinates, endName: string = ''): HighwayDetection => {
  const lowerName = endName.toLowerCase();
  for (const hw of HIGHWAY_CORRIDORS) {
    if (lowerName.includes(hw.shortName.toLowerCase()) || lowerName.includes(hw.name.toLowerCase())) {
      return buildHWDetection(hw);
    }
  }
  const minLat = Math.min(start[0], end[0]), maxLat = Math.max(start[0], end[0]);
  const minLng = Math.min(start[1], end[1]), maxLng = Math.max(start[1], end[1]);
  for (const hw of HIGHWAY_CORRIDORS) {
    const overlap = !(maxLat < hw.bounds.lat[0] || minLat > hw.bounds.lat[1] || maxLng < hw.bounds.lng[0] || minLng > hw.bounds.lng[1]);
    if (overlap) return buildHWDetection(hw);
  }
  return { detected: false, kantoLabel: '', kantoAdvice: '' };
};

const buildHWDetection = (hw: HighwayCorridor): HighwayDetection => ({
  detected:    true,
  highway:     hw,
  kantoLabel:  `Kanto ng ${hw.shortName}`,
  kantoAdvice: `Baba po sa kanto ng ${hw.shortName}. Dito na po kayo sasakay ng Jeep/Bus.`,
});

// ─────────────────────────────────────────────────────────────────
//  MODELS
// ─────────────────────────────────────────────────────────────────

export interface RouteLeg {
  step:          number;
  vehicle:       string;
  vehicleLabel:  string;
  from:          string;
  to:            string;
  path:          Coordinates[];
  color:         string;
  fareMin:       number;
  fareMax:       number;
  fareLabel:     string;
  fareType:      'special' | 'standard' | 'negotiable';
  whatToSay:     string;
  isTransferNode: boolean;
  transferLabel?: string;
  legRatio:      number;
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

export const haversineKm = (a: Coordinates, b: Coordinates): number => {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const aa = Math.sin(dLat/2)**2 + Math.cos(a[0]*Math.PI/180) * Math.cos(b[0]*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
};

export const splitGeometry = (coords: Coordinates[], ratios: number[]): Coordinates[][] => {
  const total = coords.length;
  const result: Coordinates[][] = [];
  let pos = 0;
  for (let i = 0; i < ratios.length; i++) {
    const count = i === ratios.length - 1 ? total - pos : Math.max(2, Math.round(ratios[i] * total));
    result.push(coords.slice(pos, pos + count));
    pos = Math.min(pos + count, total);
  }
  return result;
};

export const makeLeg = (
  step: number, vehicle: string, from: string, to: string,
  fareMin: number, fareMax: number, fareType: RouteLeg['fareType'],
  whatToSay: string, isTransferNode: boolean, legRatio: number, transferLabel?: string
): RouteLeg => ({
  step, vehicle,
  vehicleLabel: vehicle === 'train' ? 'LRT/MRT' : vehicle === 'walking' ? 'Walk' : vehicle.charAt(0).toUpperCase() + vehicle.slice(1),
  from, to, path: [],
  color: VEHICLE_COLORS_HEX[vehicle] ?? '#1a00b2',
  fareMin, fareMax,
  fareLabel: fareType === 'special' ? `₱${fareMin}–${fareMax}` : `₱${fareMin}`,
  fareType, whatToSay, isTransferNode, transferLabel, legRatio,
});
