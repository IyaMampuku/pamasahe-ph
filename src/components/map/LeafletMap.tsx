import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Coordinates } from '../../contexts/LocationContext';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// ── MapUpdater: smoothly recenters the map on coord changes ────────
const MapUpdater: React.FC<{ center: Coordinates; zoom?: number }> = ({ center, zoom = 14 }) => {
  const map = useMap();
  const prevCenter = useRef<Coordinates>(center);

  useEffect(() => {
    if (
      Math.abs(center[0] - prevCenter.current[0]) > 0.0001 ||
      Math.abs(center[1] - prevCenter.current[1]) > 0.0001
    ) {
      map.flyTo(center, zoom, { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);

  return null;
};

// ── Transfer Node Marker ────────────────────────────────────────────
const TransferMarker: React.FC<{ position: Coordinates; color: string; label: string }> = ({
  position, color, label
}) => (
  <CircleMarker
    center={position}
    radius={8}
    pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5 }}
  >
    <div title={label} />
  </CircleMarker>
);

// ── Props ───────────────────────────────────────────────────────────
export interface LeafletMapLeg {
  path:          Coordinates[];
  color:         string;
  isTransferNode?: boolean;
  transferLabel?: string;
}

interface LeafletMapProps {
  center:          Coordinates;
  markers?:        { position: Coordinates; popup?: string }[];
  route?:          Coordinates[];
  routeColor?:     string;
  routeLegs?:      LeafletMapLeg[];
  highwayWarning?: string;   // When set, shows tricycle-restricted overlay
  zoom?:           number;
  className?:      string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  markers = [],
  route   = [],
  routeColor = '#1a00b2',
  routeLegs,
  highwayWarning,
  zoom = 14,
  className = 'w-full h-full z-0',
}) => {
  // Derive transfer node positions from leg endpoints
  const transferNodes: { position: Coordinates; color: string; label: string }[] = [];
  if (routeLegs) {
    for (let i = 0; i < routeLegs.length - 1; i++) {
      const leg = routeLegs[i];
      if (leg.isTransferNode && leg.path.length > 0) {
        const lastPt = leg.path[leg.path.length - 1];
        transferNodes.push({
          position: lastPt,
          color: routeLegs[i + 1]?.color ?? '#1a00b2',
          label: leg.transferLabel ?? 'Transfer point',
        });
      }
    }
  }

  return (
    <div className={`${className} relative`}>
      <MapContainer center={center} zoom={zoom} zoomControl={false} className="w-full h-full">
        <TileLayer attribution="&copy; OSM" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater center={center} zoom={zoom} />

        {/* Standard markers (origin / destination) */}
        {markers.map((m, i) => <Marker key={i} position={m.position} />)}

        {/* ── Multi-leg route (intermodal) ── */}
        {routeLegs
          ? routeLegs.map((leg, i) =>
              leg.path.length > 1 ? (
                <Polyline
                  key={`leg-${i}-${leg.color}`}
                  positions={leg.path}
                  color={leg.color}
                  weight={6}
                  opacity={0.85}
                />
              ) : null
            )
          : /* ── Single-color route (legacy) ── */
            route.length > 1 && (
              <Polyline
                key={`route-${routeColor}-${route.length}`}
                positions={route}
                color={routeColor}
                weight={6}
                opacity={0.8}
              />
            )
        }

        {/* Transfer node indicators */}
        {transferNodes.map((tn, i) => (
          <TransferMarker key={`tn-${i}`} position={tn.position} color={tn.color} label={tn.label} />
        ))}
      </MapContainer>

      {/* Highway restriction warning overlay — Minimalist floating pill */}
      {highwayWarning && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] pointer-events-none w-full px-10">
          <div className="bg-red-500/95 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg flex items-center justify-center space-x-2 uppercase tracking-widest border border-red-400/30 mx-auto max-w-max">
            <span>{highwayWarning}</span>
          </div>
        </div>
      )}
    </div>
  );
};
