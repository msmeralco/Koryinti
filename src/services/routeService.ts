import { Station, Route } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  needsCharging,
  estimateBatteryConsumption,
  getDefaultVehicleSpecs,
} from './vehicleDatabase';
import { calculateRoute as calculateOpenRoute } from './openRouteService';
import {
  searchStationsAlongRoute,
  searchStationsNearPoint,
  filterStations,
  ChargingStation,
} from './openChargeMapService';
import { searchPlaces } from './geocodingService';

/**
 * RouteService handles route calculation and charging station optimization
 * Integrates OpenRouteService for routing and OpenChargeMap for stations
 */

// Fallback mock stations (only used if APIs fail)
const FALLBACK_STATIONS: Station[] = [
  {
    id: '1',
    name: 'SM Mall of Asia EV Charging',
    address: 'SM Mall of Asia Complex, Pasay City',
    latitude: 14.5357,
    longitude: 120.9819,
    availableChargers: 3,
    totalChargers: 4,
    chargingSpeed: 'Fast (50kW)',
    pricePerKwh: 15.5,
    amenities: ['Restaurant', 'Shopping', 'Restroom', 'WiFi'],
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Bonifacio Global City Charging Hub',
    address: '26th St, Bonifacio Global City, Taguig',
    latitude: 14.5547,
    longitude: 121.0484,
    availableChargers: 2,
    totalChargers: 6,
    chargingSpeed: 'Ultra Fast (150kW)',
    pricePerKwh: 18.0,
    amenities: ['Restaurant', 'Shopping', 'Restroom', 'Security'],
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Quezon City Circle Charging Point',
    address: 'Quezon Memorial Circle, Quezon City',
    latitude: 14.6542,
    longitude: 121.05,
    availableChargers: 4,
    totalChargers: 4,
    chargingSpeed: 'Fast (50kW)',
    pricePerKwh: 14.0,
    amenities: ['Park', 'Restroom', 'Food Court'],
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Makati Central Business District Station',
    address: 'Ayala Avenue, Makati City',
    latitude: 14.5547,
    longitude: 121.0244,
    availableChargers: 5,
    totalChargers: 8,
    chargingSpeed: 'Fast (50kW)',
    pricePerKwh: 16.5,
    amenities: ['Shopping', 'Restaurant', 'WiFi', 'Security'],
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Manila Bay Area Charging',
    address: 'Roxas Boulevard, Manila',
    latitude: 14.5764,
    longitude: 120.9822,
    availableChargers: 2,
    totalChargers: 3,
    chargingSpeed: 'Standard (22kW)',
    pricePerKwh: 12.0,
    amenities: ['Scenic View', 'Restroom'],
    rating: 4.0,
  },
];

interface RouteCalculationParams {
  from: string;
  to: string;
  vehicleRange?: number; // km per full charge (default: 300km)
  currentBatteryPercent?: number; // 0-100 (default: 80%)
}

/**
 * Calculate route with optimal charging stops
 * Uses real APIs: OpenRouteService for routing, OpenChargeMap for stations
 */
export async function calculateRoute(params: RouteCalculationParams): Promise<Route> {
  const { from, to } = params;

  try {
    // Get vehicle data from storage
    let vehicleData = null;
    try {
      const stored = await AsyncStorage.getItem('vehicleData');
      vehicleData = stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    }

    // Use stored data or defaults
    const defaultSpecs = getDefaultVehicleSpecs();
    const vehicleRange = vehicleData?.range || params.vehicleRange || defaultSpecs.range;
    const currentBatteryPercent =
      vehicleData?.currentBatteryPercent || params.currentBatteryPercent || 80;
    const batteryCapacity = vehicleData?.batteryCapacity || defaultSpecs.batteryCapacity;

    // Step 1: Geocode the from/to addresses to get coordinates
    const [fromResults, toResults] = await Promise.all([searchPlaces(from), searchPlaces(to)]);

    if (!fromResults.length || !toResults.length) {
      throw new Error('Could not find coordinates for addresses');
    }

    const fromCoords = {
      latitude: parseFloat(fromResults[0].lat),
      longitude: parseFloat(fromResults[0].lon),
    };
    const toCoords = {
      latitude: parseFloat(toResults[0].lat),
      longitude: parseFloat(toResults[0].lon),
    };

    // Step 2: Calculate route using OpenRouteService
    const routeData = await calculateOpenRoute(fromCoords, toCoords);
    const distance = routeData.distance; // in km
    const estimatedTime = Math.round(routeData.duration / 60); // convert minutes to hours

    // Step 3: Check if charging is needed
    const requiresCharging = needsCharging(currentBatteryPercent, distance, vehicleRange, 20);

    // Calculate battery consumption
    const batteryUsed = estimateBatteryConsumption(distance, batteryCapacity);
    const batteryAfterTrip = currentBatteryPercent - batteryUsed;

    // Log for debugging
    if (__DEV__) {
      console.warn('Route Calculation:', {
        from,
        to,
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedTime}h ${Math.round(routeData.duration % 60)}m`,
        currentBattery: `${currentBatteryPercent}%`,
        batteryAfterTrip: `${batteryAfterTrip.toFixed(1)}%`,
        requiresCharging,
        vehicleRange: `${vehicleRange} km`,
      });
    }

    // Step 4: Find charging stations if needed
    let suggestedStations: Station[] = [];
    if (requiresCharging) {
      // Search for stations along the route
      const chargingStations = await searchStationsAlongRoute(routeData.geometry, 15); // 15km corridor

      // Filter for available and preferably fast chargers
      const filteredStations = filterStations(chargingStations, {
        onlyAvailable: true,
        minPowerKW: 22, // At least Level 2 charging
      });

      // Convert to our Station format and take top 3
      suggestedStations = filteredStations.slice(0, 3).map(convertToStation);

      if (__DEV__) {
        console.warn(`Found ${filteredStations.length} suitable charging stations`);
      }
    }

    return {
      id: `route-${Date.now()}`,
      from,
      to,
      distance: Math.round(distance),
      estimatedTime,
      suggestedStations,
    };
  } catch (error) {
    console.error('Error calculating route:', error);

    // Fallback to mock data if APIs fail
    if (__DEV__) {
      console.warn('Using fallback mock route data due to error');
    }

    return {
      id: `route-${Date.now()}`,
      from,
      to,
      distance: 45,
      estimatedTime: 1,
      suggestedStations: FALLBACK_STATIONS.slice(0, 2),
    };
  }
}

/**
 * Convert OpenChargeMap station to our Station format
 */
function convertToStation(ocmStation: ChargingStation): Station {
  // Determine charging speed category
  let chargingSpeed = 'Standard (22kW)';
  if (ocmStation.powerKW) {
    if (ocmStation.powerKW >= 150) {
      chargingSpeed = `Ultra Fast (${ocmStation.powerKW}kW)`;
    } else if (ocmStation.powerKW >= 50) {
      chargingSpeed = `Fast (${ocmStation.powerKW}kW)`;
    } else {
      chargingSpeed = `Standard (${ocmStation.powerKW}kW)`;
    }
  }

  // Estimate available/total chargers
  const totalChargers = ocmStation.numberOfPoints || 2;
  const availableChargers = ocmStation.isAvailable ? Math.max(1, Math.floor(totalChargers / 2)) : 0;

  return {
    id: ocmStation.id.toString(),
    name: ocmStation.name,
    address: ocmStation.address,
    latitude: ocmStation.latitude,
    longitude: ocmStation.longitude,
    availableChargers,
    totalChargers,
    chargingSpeed,
    pricePerKwh: 15.0, // Default price - OpenChargeMap doesn't always have this
    amenities: ['Restroom', 'WiFi'], // Generic amenities
    rating: 4.0, // Default rating
  };
}

/**
 * Get nearby charging stations using OpenChargeMap
 */
export async function getNearbyChargingStations(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Station[]> {
  try {
    const stations = await searchStationsNearPoint(latitude, longitude, radiusKm, 20);
    return stations.map(convertToStation);
  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    return FALLBACK_STATIONS;
  }
}

/**
 * Get station details by ID (searches OpenChargeMap)
 */
export async function getStationById(stationId: string): Promise<Station | undefined> {
  try {
    // For now, search near Manila and filter by ID
    // In production, you'd want a direct station lookup endpoint
    const stations = await searchStationsNearPoint(14.5995, 120.9842, 50, 100);
    const found = stations.find(s => s.id.toString() === stationId);
    return found ? convertToStation(found) : undefined;
  } catch (error) {
    console.error('Error fetching station:', error);
    return FALLBACK_STATIONS.find(s => s.id === stationId);
  }
}

/**
 * Get all available stations (returns fallback for compatibility)
 */
export function getAllStations(): Station[] {
  return FALLBACK_STATIONS;
}
