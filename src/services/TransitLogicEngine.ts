import type { Coordinates } from '../contexts/LocationContext';
import {
  haversineKm,
  detectHighwayInRoute,
  getZoneResult,
  makeLeg,
  type RouteLeg,
  type RouteOption,
  type SubdivisionZone,
  type HighwayDetection,
  type TransitPlan,
} from './TransitLogicBase';

// ─────────────────────────────────────────────────────────────────
//  SPEED CONSTANTS
// ─────────────────────────────────────────────────────────────────

const SPEED: Record<string, number> = {
  tricycle: 4, jeepney: 2.5, bus: 2, train: 1.5,
};
const WALK_MIN_PER_KM = 12;
const LAST_MILE_KM = 0.25; // 200-250 m — use walking instead of a tricycle

// ─────────────────────────────────────────────────────────────────
//  ROUTE CONTEXT
// ─────────────────────────────────────────────────────────────────

interface Ctx {
  startLabel:  string;
  destName:    string;
  startSubdiv: SubdivisionZone | null;
  endSubdiv:   SubdivisionZone | null;
  hw:          HighwayDetection;
  distKm:      number;
  IR:          number;   // interior leg ratio (0.15)
}

const lastMileWalk = (distKm: number, endSubdiv: SubdivisionZone | null) =>
  !endSubdiv && distKm <= LAST_MILE_KM;

// ─────────────────────────────────────────────────────────────────
//  OPTION A — Standard: Trike/Walk → Jeep/Bus → Walk/Trike
// ─────────────────────────────────────────────────────────────────

function buildOptionA(ctx: Ctx, mainV: 'jeepney' | 'bus'): RouteLeg[] {
  const { startLabel, destName, startSubdiv, endSubdiv, hw, distKm, IR } = ctx;
  const legs: RouteLeg[] = [];
  let s = 1;

  // ─ Leg 1: Interior / Kanto approach ─
  if (startSubdiv) {
    legs.push(makeLeg(s++, 'tricycle', startLabel, startSubdiv.gateName,
      startSubdiv.fareMin, startSubdiv.fareMax, 'special',
      `Pahatid po sa ${startSubdiv.gateName}.`,
      true, IR, `Board ${mainV === 'bus' ? 'Bus' : 'Jeepney'} at ${startSubdiv.gateName}`));
  } else if (hw.detected) {
    legs.push(makeLeg(s++, 'tricycle', startLabel, hw.kantoLabel,
      25, 40, 'standard',
      `Pahatid po sa ${hw.kantoLabel}.`,
      true, 0.20, `Board ${mainV === 'bus' ? 'Bus' : 'Jeepney'} dito sa kanto`));
  }

  // ─ Leg 2: Main highway vehicle ─
  const fromNode  = startSubdiv?.gateName ?? (hw.detected ? hw.kantoLabel : startLabel);
  const toNode    = endSubdiv?.gateName ?? destName;
  const hwNote    = hw.detected ? `Highway Zone (${hw.highway?.shortName ?? ''}) — Tricycles prohibited. ` : '';
  const walkFinal = lastMileWalk(distKm, endSubdiv);
  const mainRatio = Math.max(0.40,
    1 - IR * ((startSubdiv ? 1 : 0) + (endSubdiv ? 1 : 0)) -
    (hw.detected && !startSubdiv ? 0.20 : 0));

  legs.push(makeLeg(s++, mainV, fromNode, toNode,
    mainV === 'bus' ? 15 : 13,
    mainV === 'bus' ? 25 : 15, 'standard',
    `${hwNote}Bayad po, isa hanggang ${toNode}.`,
    !!endSubdiv || walkFinal, mainRatio,
    endSubdiv  ? `Switch to Tricycle at ${endSubdiv.gateName}` :
    walkFinal  ? `Walk to ${destName} (~${Math.round(distKm * 1000)} m)` : undefined));

  // ─ Leg 3: Last mile ─
  if (endSubdiv) {
    legs.push(makeLeg(s++, 'tricycle', endSubdiv.gateName, destName,
      endSubdiv.fareMin, endSubdiv.fareMax, 'special',
      `Pahatid po sa loob ng ${endSubdiv.name}, sa ${destName}.`, false, IR));
  } else if (walkFinal) {
    legs.push(makeLeg(s++, 'walking', toNode, destName,
      0, 0, 'standard', `Lakad na lang po hanggang ${destName}. Malapit na!`, false, 0.05));
  }

  return legs;
}

// ─────────────────────────────────────────────────────────────────
//  OPTION B — Budget: Walk → Jeep → Walk
// ─────────────────────────────────────────────────────────────────

function buildOptionB(ctx: Ctx): RouteLeg[] {
  const { startLabel, destName, hw, distKm } = ctx;
  const legs: RouteLeg[] = [];
  let s = 1;

  const stop = hw.detected ? hw.kantoLabel : 'Nearest Jeepney Stop';

  legs.push(makeLeg(s++, 'walking', startLabel, stop,
    0, 0, 'standard', `Lakad po hanggang ${stop}.`,
    true, 0.15, `Board Jeepney dito`));

  const walkFinal = lastMileWalk(distKm, null);
  legs.push(makeLeg(s++, 'jeepney', stop, destName,
    13, 15, 'standard', `Bayad po, isa hanggang ${destName}.`,
    walkFinal, 0.75, walkFinal ? `Walk to ${destName}` : undefined));

  if (walkFinal) {
    legs.push(makeLeg(s++, 'walking', destName, destName,
      0, 0, 'standard', `Lakad na lang po hanggang ${destName}. Kaunti na lang!`, false, 0.10));
  }

  return legs;
}

// ─────────────────────────────────────────────────────────────────
//  OPTION C — Special: All-Tricycle (HIGHWAY-FREE ONLY)
// ─────────────────────────────────────────────────────────────────

function buildOptionC(ctx: Ctx): RouteLeg[] | null {
  const { startLabel, destName, startSubdiv, endSubdiv, hw, distKm, IR } = ctx;
  if (hw.detected) return null;   // HARD BLOCK

  const legs: RouteLeg[] = [];
  let s = 1;
  const base = Math.max(Math.round(distKm * 12), 50);

  if (startSubdiv) {
    legs.push(makeLeg(s++, 'tricycle', startLabel, startSubdiv.gateName,
      startSubdiv.fareMin, startSubdiv.fareMax, 'special',
      `Pahatid po sa ${startSubdiv.gateName}. Mag-special na papunta ${destName}.`,
      true, IR, `Arrange 2nd Tricycle at ${startSubdiv.gateName}`));
  }

  legs.push(makeLeg(s++, 'tricycle',
    startSubdiv ? startSubdiv.gateName : startLabel,
    endSubdiv   ? endSubdiv.gateName   : destName,
    base, base + 40, 'special',
    `Pahatid po sa ${endSubdiv ? endSubdiv.gateName : destName}. Special trip.`,
    !!endSubdiv, startSubdiv ? 1 - 2 * IR : 1.0,
    endSubdiv ? `Enter ${endSubdiv.name}` : undefined));

  if (endSubdiv) {
    legs.push(makeLeg(s++, 'tricycle', endSubdiv.gateName, destName,
      endSubdiv.fareMin, endSubdiv.fareMax, 'special',
      `Pahatid po sa loob ng ${endSubdiv.name}, sa ${destName}.`, false, IR));
  }

  return legs;
}

// ─────────────────────────────────────────────────────────────────
//  PUBLIC EXPORTS
// ─────────────────────────────────────────────────────────────────

export { splitGeometry } from './TransitLogicBase';

export const generateRouteOptions = (
  startCoords: Coordinates,
  endCoords:   Coordinates,
  startName:   string,
  endName:     string,
): RouteOption[] => {
  const hw         = detectHighwayInRoute(startCoords, endCoords, endName);
  const startZone  = getZoneResult(startCoords, startName);
  const endZone    = getZoneResult(endCoords,   endName);
  const distKm     = haversineKm(startCoords, endCoords);

  const ctx: Ctx = {
    startLabel:  startName.split(',')[0],
    destName:    endName.split(',')[0],
    startSubdiv: startZone.type === 'subdivision' ? startZone.zone! : null,
    endSubdiv:   endZone.type   === 'subdivision' ? endZone.zone!   : null,
    hw, distKm, IR: 0.15,
  };

  const mainV: 'jeepney' | 'bus' = distKm > 8 ? 'bus' : 'jeepney';
  const aLegs = buildOptionA(ctx, mainV);
  const bLegs = buildOptionB(ctx);
  const cLegs = buildOptionC(ctx);
  const hwBadge = hw.detected ? ' 🚫🛺' : '';

  const opts: RouteOption[] = [
    {
      id: 'commuter', badge: 'RECOMMENDED',
      label:    `Option A — Standard${hwBadge}`,
      tagline:  aLegs.map(l => l.vehicleLabel).join(' → '),
      priority: 'fare', legs: aLegs,
      totalFareMin:     aLegs.reduce((s, l) => s + l.fareMin, 0),
      totalFareMax:     aLegs.reduce((s, l) => s + l.fareMax, 0),
      estimatedMinutes: Math.round((ctx.startSubdiv || hw.detected ? 5 : 0) + distKm * SPEED[mainV] + (ctx.endSubdiv ? 5 : 0)),
      badgeColor: 'bg-green-100 text-green-700 border-green-300',
    },
    {
      id: 'express', badge: 'BUDGET',
      label:    `Option B — Budget Walk`,
      tagline:  bLegs.map(l => l.vehicleLabel).join(' → '),
      priority: 'fare', legs: bLegs,
      totalFareMin:     bLegs.reduce((s, l) => s + l.fareMin, 0),
      totalFareMax:     bLegs.reduce((s, l) => s + l.fareMax, 0),
      estimatedMinutes: Math.round(distKm * 0.15 * WALK_MIN_PER_KM + distKm * 0.70 * SPEED.jeepney + distKm * 0.15 * WALK_MIN_PER_KM),
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
    },
  ];

  if (cLegs) {
    opts.push({
      id: 'solo', badge: 'CONVENIENT',
      label:    `Option C — Special Trip`,
      tagline:  'All-Tricycle • Door to Door',
      priority: 'convenience', legs: cLegs,
      totalFareMin:     cLegs.reduce((s, l) => s + l.fareMin, 0),
      totalFareMax:     cLegs.reduce((s, l) => s + l.fareMax, 0),
      estimatedMinutes: Math.round(distKm * SPEED.tricycle + (ctx.startSubdiv ? 5 : 0)),
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
    });
  }

  return opts;
};

export const getTransitPlan = (
  start:     Coordinates,
  end:       Coordinates,
  startName: string,
  endName:   string,
): TransitPlan => {
  const opts       = generateRouteOptions(start, end, startName, endName);
  const startZone  = getZoneResult(start, startName);
  const endZone    = getZoneResult(end,   endName);
  const sub        = startZone.zone;

  return {
    legs:            opts[0].legs,
    allowedVehicles: startZone.type === 'subdivision'
      ? ['tricycle']
      : ['jeepney', 'bus', 'train', 'tricycle', 'walking'],
    startZone, endZone,
    suggestedFirstLeg: sub ? `Mag-tricycle hanggang ${sub.gateName}` : undefined,
    fareOverride:      sub ? `₱${sub.fareMin}–${sub.fareMax} (Special)`  : undefined,
    advice:            startZone.type === 'subdivision'
      ? `Private Village: Tricycle to gate required.`
      : 'All transport modes available.',
  };
};
