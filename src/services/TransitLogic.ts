import type { Coordinates } from '../contexts/LocationContext';

// ─────────────────────────────────────────────────────────────────
//  ZONE DATABASE
// ─────────────────────────────────────────────────────────────────

export type ZoneType = 'subdivision' | 'barangay' | 'main_road';
export type RoadClass = 'residential' | 'barangay' | 'primary' | 'highway' | 'unknown';

export interface SubdivisionZone {
  name: string;
  gateName: string;          // Name used in the "Pahatid po sa..." prompt
  fareMin: number;           // Minimum special trip fare (₱)
  fareMax: number;
  bounds: {
    lat: [number, number];
    lng: [number, number];
  };
}

/** 
 * CONSTRAINED_ZONES — hard-coded geofence database for gated communities.
 * Add new subdivisions here as needed. 
 */
export const CONSTRAINED_ZONES: SubdivisionZone[] = [
  {
    name: 'BF Homes',
    gateName: 'BF Homes Main Gate (Aguirre Ave.)',
    fareMin: 40,
    fareMax: 60,
    bounds: { lat: [14.42, 14.46], lng: [121.0, 121.05] }
  },
  {
    name: 'Moonwalk Village',
    gateName: 'Moonwalk Village Gate (Las Piñas Rd.)',
    fareMin: 35,
    fareMax: 50,
    bounds: { lat: [14.48, 14.5], lng: [121.0, 121.02] }
  },
  {
    name: 'Pilar Village',
    gateName: 'Pilar Village Gate (Alabang-Zapote Rd.)',
    fareMin: 35,
    fareMax: 50,
    bounds: { lat: [14.43, 14.45], lng: [120.98, 121.0] }
  },
  {
    name: 'Sun Valley',
    gateName: 'Sun Valley Gate (Quirino Ave.)',
    fareMin: 40,
    fareMax: 60,
    bounds: { lat: [14.38, 14.42], lng: [121.01, 121.05] }
  },
  {
    name: 'Philips Park Village',
    gateName: 'Philips Park Gate (Molino Rd.)',
    fareMin: 30,
    fareMax: 50,
    bounds: { lat: [14.44, 14.47], lng: [120.97, 121.0] }
  },
  {
    name: 'Tuazon Subdivision',
    gateName: 'Tuazon Subdivision Gate',
    fareMin: 30,
    fareMax: 45,
    bounds: { lat: [14.51, 14.55], lng: [121.0, 121.04] }
  },
];

// ─────────────────────────────────────────────────────────────────
//  ZONE DETECTION
// ─────────────────────────────────────────────────────────────────

export interface ZoneResult {
  type: ZoneType;
  zone?: SubdivisionZone;
}

/** Find which constrained zone a coordinate falls in (if any). */
export const getZoneResult = (coords: Coordinates, displayName: string = ''): ZoneResult => {
  const [lat, lng] = coords;

  // 1. Hard-coded geofence lookup (most accurate)
  for (const zone of CONSTRAINED_ZONES) {
    if (
      lat >= zone.bounds.lat[0] && lat <= zone.bounds.lat[1] &&
      lng >= zone.bounds.lng[0] && lng <= zone.bounds.lng[1]
    ) {
      return { type: 'subdivision', zone };
    }
  }

  // 2. OSM display-name string matching (fallback for uncatalogued areas)
  const lower = displayName.toLowerCase();
  const subdivisionKeywords = [
    'subdivision', 'village', 'subd.', 'subd', 'executive',
    'homes', 'estate', 'residences', 'gated', 'compound'
  ];
  if (subdivisionKeywords.some(k => lower.includes(k))) {
    // Build a synthetic zone for string-matched subdivisions
    const syntheticZone: SubdivisionZone = {
      name: displayName.split(',')[0],
      gateName: `${displayName.split(',')[0]} Gate`,
      fareMin: 40,
      fareMax: 60,
      bounds: { lat: [0, 0], lng: [0, 0] } // not used for string-matched
    };
    return { type: 'subdivision', zone: syntheticZone };
  }

  if (lower.includes('barangay') || lower.includes('brgy')) {
    return { type: 'barangay' };
  }

  return { type: 'main_road' };
};

// ─────────────────────────────────────────────────────────────────
//  ROAD CLASS INFERENCE
// ─────────────────────────────────────────────────────────────────

export const inferRoadClass = (displayName: string): RoadClass => {
  const lower = displayName.toLowerCase();
  if (lower.includes('highway') || lower.includes('expressway') || lower.includes('national rd')) return 'highway';
  if (lower.includes('avenue') || lower.includes('blvd') || lower.includes('boulevard')) return 'primary';
  if (lower.includes('st.') || lower.includes('street') || lower.includes('barangay road')) return 'barangay';
  if (lower.includes('interior') || lower.includes('phase') || lower.includes('block')) return 'residential';
  return 'unknown';
};

/** Returns which vehicles are BANNED on a given road class. */
export const getBannedVehiclesForRoad = (roadClass: RoadClass): string[] => {
  switch (roadClass) {
    case 'residential':
    case 'barangay':
      return ['bus', 'train']; // Hard-disable large vehicles
    case 'highway':
    case 'primary':
      return []; // All allowed
    default:
      return [];
  }
};

// ─────────────────────────────────────────────────────────────────
//  ROUTE LEG MODEL
// ─────────────────────────────────────────────────────────────────

export interface RouteLeg {
  step: number;
  vehicle: string;           // e.g. 'tricycle', 'jeepney', 'bus'
  vehicleLabel: string;
  from: string;
  to: string;
  fareMin: number;
  fareMax: number;
  fareLabel: string;
  fareType: 'special' | 'standard' | 'negotiable';
  whatToSay: string;
  isRestricted: boolean;     // True if vehicle is geo-blocked on first/last mile
}

export interface TransitPlan {
  legs: RouteLeg[];
  allowedVehicles: string[];
  startZone: ZoneResult;
  endZone: ZoneResult;
  // Legacy fields for backwards-compat with Results.tsx
  suggestedFirstLeg?: string;
  fareOverride?: string;
  advice?: string;
}

// ─────────────────────────────────────────────────────────────────
//  CORE ALGORITHM
// ─────────────────────────────────────────────────────────────────

export const getTransitPlan = (
  start: Coordinates,
  _end: Coordinates,
  startName: string,
  endName: string
): TransitPlan => {
  const startZone = getZoneResult(start, startName);
  const endZone   = getZoneResult(_end, endName);

  const startRoadClass = inferRoadClass(startName);
  const bannedOnStart  = getBannedVehiclesForRoad(startRoadClass);

  // ── CASE 1: Starting INSIDE a subdivision ──────────────────────
  if (startZone.type === 'subdivision' && startZone.zone) {
    const { zone } = startZone;
    const fareLabel = `₱${zone.fareMin}–${zone.fareMax} (Special)`;

    const leg1: RouteLeg = {
      step: 1,
      vehicle: 'tricycle',
      vehicleLabel: 'Tricycle',
      from: startName.split(',')[0],
      to: zone.gateName,
      fareMin: zone.fareMin,
      fareMax: zone.fareMax,
      fareLabel,
      fareType: 'special',
      whatToSay: `Pahatid po sa ${zone.gateName}.`,
      isRestricted: false,
    };

    // Leg 2 depends on end zone
    const leg2Vehicle = endZone.type === 'subdivision' ? 'tricycle' : 'jeepney';
    const leg2FareMin = leg2Vehicle === 'jeepney' ? 13 : 30;
    const leg2FareMax = leg2Vehicle === 'jeepney' ? 15 : 50;
    const finalDest = endName.split(',')[0];
    const leg2: RouteLeg = {
      step: 2,
      vehicle: leg2Vehicle,
      vehicleLabel: leg2Vehicle === 'jeepney' ? 'Jeepney' : 'Tricycle',
      from: zone.gateName,
      to: finalDest,
      fareMin: leg2FareMin,
      fareMax: leg2FareMax,
      fareLabel: `₱${leg2FareMin}`,
      fareType: 'standard',
      whatToSay: `Bayad po, isa hanggang ${finalDest}.`,
      isRestricted: false,
    };

    return {
      legs: [leg1, leg2],
      allowedVehicles: ['tricycle'],  // Only tricycle for first leg
      startZone,
      endZone,
      // Legacy compat
      suggestedFirstLeg: `Mag-tricycle hanggang ${zone.gateName}`,
      fareOverride: fareLabel,
      advice: `Private Village: Jeep/Bus restricted inside ${zone.name}. Take Tricycle to the gate first.`,
    };
  }

  // ── CASE 2: Ending INSIDE a subdivision ───────────────────────
  if (endZone.type === 'subdivision' && endZone.zone) {
    const { zone } = endZone;
    const finalDest = endName.split(',')[0];

    const leg1: RouteLeg = {
      step: 1,
      vehicle: 'jeepney',
      vehicleLabel: 'Jeepney',
      from: startName.split(',')[0],
      to: zone.gateName,
      fareMin: 13,
      fareMax: 15,
      fareLabel: '₱13',
      fareType: 'standard',
      whatToSay: `Bayad po, isa hanggang ${zone.gateName}.`,
      isRestricted: false,
    };

    const leg2: RouteLeg = {
      step: 2,
      vehicle: 'tricycle',
      vehicleLabel: 'Tricycle',
      from: zone.gateName,
      to: finalDest,
      fareMin: zone.fareMin,
      fareMax: zone.fareMax,
      fareLabel: `₱${zone.fareMin}–${zone.fareMax} (Special)`,
      fareType: 'special',
      whatToSay: `Pahatid po sa loob ng ${zone.name}, sa ${finalDest}.`,
      isRestricted: false,
    };

    return {
      legs: [leg1, leg2],
      allowedVehicles: ['jeepney', 'bus', 'train', 'tricycle'],
      startZone,
      endZone,
      advice: `Destination is inside ${zone.name}. Jeep/Bus drops off at gate — tricycle enters the village.`,
    };
  }

  // ── CASE 3: Barangay roads ─────────────────────────────────────
  if (startZone.type === 'barangay') {
    const allowed = ['tricycle', 'jeepney', 'walking']
      .filter(v => !bannedOnStart.includes(v));
    return {
      legs: [],
      allowedVehicles: allowed,
      startZone,
      endZone,
      advice: 'Narrow roads: Tricycle or Jeepney recommended.',
    };
  }

  // ── CASE 4: Main Road / Highway (default) ─────────────────────
  const allVehicles = ['jeepney', 'bus', 'train', 'tricycle']
    .filter(v => !bannedOnStart.includes(v));

  return {
    legs: [],
    allowedVehicles: allVehicles,
    startZone,
    endZone,
    advice: allVehicles.length < 4
      ? `Road restriction: ${bannedOnStart.join(', ')} not suitable here.`
      : 'High accessibility: All transport modes available.',
  };
};
