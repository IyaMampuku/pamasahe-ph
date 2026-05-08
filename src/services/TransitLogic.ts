import type { Coordinates } from '../contexts/LocationContext';

export type ZoneType = 'subdivision' | 'barangay' | 'main_road';

export interface ConstrainedZone {
  name: string;
  type: ZoneType;
  bounds: {
    lat: [number, number];
    lng: [number, number];
  };
}

// Manual Override for major Las Piñas/Manila subdivisions
export const CONSTRAINED_ZONES: ConstrainedZone[] = [
  {
    name: 'BF Homes',
    type: 'subdivision',
    bounds: { lat: [14.42, 14.46], lng: [121.0, 121.05] }
  },
  {
    name: 'Moonwalk Village',
    type: 'subdivision',
    bounds: { lat: [14.48, 14.5], lng: [121.0, 121.02] }
  },
  {
    name: 'Pilar Village',
    type: 'subdivision',
    bounds: { lat: [14.43, 14.45], lng: [120.98, 121.0] }
  }
];

export const getZoneType = (coords: Coordinates, displayName: string = ''): ZoneType => {
  const [lat, lng] = coords;
  
  // 1. Check Manual Overrides
  for (const zone of CONSTRAINED_ZONES) {
    if (lat >= zone.bounds.lat[0] && lat <= zone.bounds.lat[1] &&
        lng >= zone.bounds.lng[0] && lng <= zone.bounds.lng[1]) {
      return zone.type;
    }
  }

  // 2. Fallback to String Matching on OSM Display Name
  const lowerName = displayName.toLowerCase();
  if (lowerName.includes('subdivision') || 
      lowerName.includes('village') || 
      lowerName.includes('gated')) {
    return 'subdivision';
  }

  if (lowerName.includes('barangay') || lowerName.includes('st.')) {
    return 'barangay';
  }

  return 'main_road';
};

export interface TransitPlan {
  allowedVehicles: string[];
  suggestedFirstLeg?: string;
  fareOverride?: string;
  advice?: string;
}

export const getTransitPlan = (start: Coordinates, end: Coordinates, startName: string, endName: string): TransitPlan => {
  const startZone = getZoneType(start, startName);
  // const endZone = getZoneType(end, endName); // Reserved for future use (e.g. drop-off restrictions)

  // Subdivision Logic
  if (startZone === 'subdivision') {
    return {
      allowedVehicles: ['tricycle', 'walking'],
      suggestedFirstLeg: 'Mag-tricycle hanggang Labas/Gate',
      fareOverride: '₱30-50 (Special)',
      advice: 'Private Village: Jeep/Bus restricted inside.'
    };
  }

  if (startZone === 'barangay') {
    return {
      allowedVehicles: ['tricycle', 'jeepney', 'walking'],
      advice: 'Narrow roads: Tricycle or Jeepney recommended.'
    };
  }

  // Main Road Logic
  return {
    allowedVehicles: ['jeepney', 'bus', 'train', 'tricycle', 'walking'],
    advice: 'High accessibility: All transport modes available.'
  };
};
