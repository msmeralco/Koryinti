// Lightweight road polylines for Luzon cities and connectors
// All coordinates are approximate and intended only for visualization

export type LatLng = { latitude: number; longitude: number };
export type RoadPath = { id: string; city: string; points: LatLng[] };
export type City = {
  id: string;
  name: string;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
};

export const CITIES: City[] = [
  { id: 'manila', name: 'Metro Manila', bounds: { minLat: 14.40, maxLat: 14.80, minLng: 120.90, maxLng: 121.10 } },
  { id: 'baguio', name: 'Baguio', bounds: { minLat: 16.35, maxLat: 16.50, minLng: 120.55, maxLng: 120.65 } },
  { id: 'laoag', name: 'Laoag/Vigan', bounds: { minLat: 17.50, maxLat: 18.25, minLng: 120.35, maxLng: 120.65 } },
  { id: 'tugue', name: 'Tuguegarao', bounds: { minLat: 17.55, maxLat: 17.75, minLng: 121.65, maxLng: 121.80 } },
  { id: 'dagupan', name: 'Dagupan/Urdaneta', bounds: { minLat: 15.90, maxLat: 16.10, minLng: 120.30, maxLng: 120.60 } },
];

export const ROADS: RoadPath[] = [
  // Metro Manila radial/EDSA-like loops
  { id: 'manila-edsa-north', city: 'manila', points: [
    { latitude: 14.70, longitude: 121.03 }, { latitude: 14.66, longitude: 121.03 }, { latitude: 14.62, longitude: 121.02 }, { latitude: 14.58, longitude: 121.00 },
  ]},
  { id: 'manila-espana', city: 'manila', points: [
    { latitude: 14.61, longitude: 121.00 }, { latitude: 14.62, longitude: 121.02 }, { latitude: 14.63, longitude: 121.03 },
  ]},
  // inland south road (avoid coastline)
  { id: 'manila-south-inland', city: 'manila', points: [
    { latitude: 14.55, longitude: 121.01 }, { latitude: 14.53, longitude: 121.02 }, { latitude: 14.51, longitude: 121.03 },
  ]},

  // Baguio loops
  { id: 'baguio-loop-1', city: 'baguio', points: [
    { latitude: 16.42, longitude: 120.59 }, { latitude: 16.43, longitude: 120.61 }, { latitude: 16.44, longitude: 120.60 }, { latitude: 16.42, longitude: 120.59 },
  ]},
  { id: 'baguio-loop-2', city: 'baguio', points: [
    { latitude: 16.44, longitude: 120.60 }, { latitude: 16.45, longitude: 120.62 }, { latitude: 16.44, longitude: 120.63 },
  ]},

  // Laoag/Vigan coastal road
  { id: 'laoag-coastal', city: 'laoag', points: [
    { latitude: 18.16, longitude: 120.59 }, { latitude: 17.97, longitude: 120.49 }, { latitude: 17.62, longitude: 120.44 },
  ]},
  // Tuguegarao grid
  { id: 'tugue-grid', city: 'tugue', points: [
    { latitude: 17.62, longitude: 121.70 }, { latitude: 17.67, longitude: 121.73 }, { latitude: 17.72, longitude: 121.76 },
  ]},
  // Dagupan/Urdaneta connector
  { id: 'dgu-connector', city: 'dagupan', points: [
    { latitude: 16.06, longitude: 120.34 }, { latitude: 16.00, longitude: 120.36 }, { latitude: 15.96, longitude: 120.43 },
  ]},

  // Intercity corridors (no Manila bias)
  { id: 'laoag-vigan', city: 'laoag', points: [
    { latitude: 18.16, longitude: 120.59 }, { latitude: 17.62, longitude: 120.44 },
  ]},
  { id: 'vigan-baguio', city: 'baguio', points: [
    { latitude: 17.62, longitude: 120.44 }, { latitude: 16.44, longitude: 120.60 },
  ]},
  { id: 'baguio-dagupan', city: 'baguio', points: [
    { latitude: 16.44, longitude: 120.60 }, { latitude: 16.06, longitude: 120.34 },
  ]},
];

export const CITY_IDS = CITIES.map(c => c.id);

export function randomRoadInCity(cityId: string): RoadPath {
  const inCity = ROADS.filter(r => r.city === cityId);
  return inCity[Math.floor(Math.random() * inCity.length)];
}
