import { Station, Route } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  needsCharging,
  estimateBatteryConsumption,
  getDefaultVehicleSpecs,
} from './vehicleDatabase';

/**
 * RouteService handles route calculation and charging station optimization
 * Currently uses mock data - will integrate with real APIs later
 */

// Mock charging stations in Metro Manila
const MOCK_CHARGING_STATIONS: Station[] = [
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
 * Uses stored vehicle data to determine charging needs
 */
export async function calculateRoute(params: RouteCalculationParams): Promise<Route> {
  const { from, to } = params;

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

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock route calculation
  // In real implementation, this would call Mapbox/OpenRouteService API
  const distance = Math.floor(Math.random() * 100) + 50; // 50-150km
  const estimatedTime = Math.floor(distance / 60); // hours (assuming 60km/h avg)

  // Check if charging is needed using the smart logic
  const requiresCharging = needsCharging(currentBatteryPercent, distance, vehicleRange, 20);

  // Calculate battery consumption for this trip
  const batteryUsed = estimateBatteryConsumption(distance, batteryCapacity);
  const batteryAfterTrip = currentBatteryPercent - batteryUsed;

  // Log for debugging (will be visible in Expo)
  if (__DEV__) {
    console.warn('Route Calculation:', {
      from,
      to,
      distance,
      currentBattery: currentBatteryPercent,
      batteryAfterTrip: batteryAfterTrip.toFixed(1),
      requiresCharging,
      vehicleRange,
    });
  }

  // Find optimal charging stations if needed
  let suggestedStations: Station[] = [];
  if (requiresCharging) {
    // Strategy: Select stations based on:
    // 1. Distance from start (prefer middle of route)
    // 2. Charging speed (prefer fast chargers)
    // 3. Availability (prefer stations with available chargers)

    const sortedStations = MOCK_CHARGING_STATIONS.slice()
      .filter(s => s.availableChargers > 0)
      .sort((a, b) => {
        // Prefer fast charging stations
        const speedScore = (station: Station) => {
          if (station.chargingSpeed.includes('Ultra')) return 3;
          if (station.chargingSpeed.includes('Fast')) return 2;
          return 1;
        };
        return speedScore(b) - speedScore(a);
      });

    // Take top 2 stations for this route
    suggestedStations = sortedStations.slice(0, 2);
  }

  return {
    id: `route-${Date.now()}`,
    from,
    to,
    distance,
    estimatedTime,
    suggestedStations,
  };
}

/**
 * Get all charging stations in Metro Manila
 * Will integrate with OpenChargeMap API later
 */
export async function getNearbyChargingStations(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Station[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter stations within radius (simple distance calculation)
  return MOCK_CHARGING_STATIONS.filter(station => {
    const distance = calculateDistance(latitude, longitude, station.latitude, station.longitude);
    return distance <= radiusKm;
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get station details by ID
 */
export function getStationById(stationId: string): Station | undefined {
  return MOCK_CHARGING_STATIONS.find(station => station.id === stationId);
}

/**
 * Get all available stations (for testing/development)
 */
export function getAllStations(): Station[] {
  return MOCK_CHARGING_STATIONS;
}
