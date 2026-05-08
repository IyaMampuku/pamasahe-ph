import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Coordinates } from '../../contexts/LocationContext';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapUpdaterProps {
  center: Coordinates;
  zoom?: number;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

interface LeafletMapProps {
  center: Coordinates;
  markers?: { position: Coordinates; popup?: string }[];
  route?: Coordinates[];
  zoom?: number;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  markers = [],
  route = [],
  zoom = 14,
  className = "w-full h-full z-0"
}) => {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        
        {markers.map((m, i) => (
          <Marker key={i} position={m.position} />
        ))}
        
        {route.length > 0 && (
          <Polyline positions={route} color="#1a00b2" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
};
