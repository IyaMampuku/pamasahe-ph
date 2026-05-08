import type { Coordinates } from '../contexts/LocationContext';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const searchLocation = async (query: string): Promise<NominatimResult[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`
    );
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Nominatim search error:', error);
    return [];
  }
};

export interface RouteData {
  distance: number;
  duration: number;
  geometry: Coordinates[];
}

export const getRoute = async (start: Coordinates, end: Coordinates): Promise<RouteData | null> => {
  try {
    // OSRM expects coordinates in lon,lat format
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    );
    if (!response.ok) throw new Error('Failed to fetch route');
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Convert GeoJSON (lon, lat) to Leaflet polyline (lat, lon)
      const geometry = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as Coordinates);
      
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        geometry
      };
    }
    return null;
  } catch (error) {
    console.error('OSRM route error:', error);
    return null;
  }
};
