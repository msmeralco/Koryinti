/**
 * Vehicle Database with common EV models and their specifications
 * Data is approximate and based on manufacturer specs
 */

export interface VehicleSpec {
  make: string;
  model: string;
  batteryCapacity: number; // kWh
  range: number; // km on full charge
  chargingSpeed: string; // Fast/Standard
}

// Common EV models available in Philippines and internationally
export const EV_DATABASE: VehicleSpec[] = [
  // Tesla
  { make: 'Tesla', model: 'Model 3', batteryCapacity: 60, range: 430, chargingSpeed: 'Fast' },
  { make: 'Tesla', model: 'Model S', batteryCapacity: 100, range: 652, chargingSpeed: 'Fast' },
  { make: 'Tesla', model: 'Model X', batteryCapacity: 100, range: 536, chargingSpeed: 'Fast' },
  { make: 'Tesla', model: 'Model Y', batteryCapacity: 75, range: 525, chargingSpeed: 'Fast' },

  // BYD (Popular in Philippines)
  { make: 'BYD', model: 'Atto 3', batteryCapacity: 60, range: 420, chargingSpeed: 'Fast' },
  { make: 'BYD', model: 'Seal', batteryCapacity: 82, range: 570, chargingSpeed: 'Fast' },
  { make: 'BYD', model: 'Dolphin', batteryCapacity: 44, range: 340, chargingSpeed: 'Standard' },

  // Nissan
  { make: 'Nissan', model: 'Leaf', batteryCapacity: 40, range: 270, chargingSpeed: 'Standard' },
  { make: 'Nissan', model: 'Ariya', batteryCapacity: 87, range: 500, chargingSpeed: 'Fast' },

  // Hyundai
  {
    make: 'Hyundai',
    model: 'Kona Electric',
    batteryCapacity: 64,
    range: 484,
    chargingSpeed: 'Fast',
  },

  { make: 'Hyundai', model: 'Ioniq 5', batteryCapacity: 77, range: 481, chargingSpeed: 'Fast' },
  { make: 'Hyundai', model: 'Ioniq 6', batteryCapacity: 77, range: 614, chargingSpeed: 'Fast' },

  // Kia
  { make: 'Kia', model: 'EV6', batteryCapacity: 77, range: 528, chargingSpeed: 'Fast' },
  { make: 'Kia', model: 'Niro EV', batteryCapacity: 64, range: 463, chargingSpeed: 'Fast' },

  // MG (Popular in Philippines)
  { make: 'MG', model: 'ZS EV', batteryCapacity: 51, range: 320, chargingSpeed: 'Standard' },
  { make: 'MG', model: 'MG4', batteryCapacity: 64, range: 450, chargingSpeed: 'Fast' },

  // Chevrolet
  { make: 'Chevrolet', model: 'Bolt EV', batteryCapacity: 66, range: 417, chargingSpeed: 'Fast' },

  // Ford
  { make: 'Ford', model: 'Mustang Mach-E', batteryCapacity: 88, range: 491, chargingSpeed: 'Fast' },

  // Volkswagen
  { make: 'Volkswagen', model: 'ID.4', batteryCapacity: 82, range: 418, chargingSpeed: 'Fast' },

  // BMW
  { make: 'BMW', model: 'i3', batteryCapacity: 42, range: 260, chargingSpeed: 'Standard' },
  { make: 'BMW', model: 'iX', batteryCapacity: 111, range: 630, chargingSpeed: 'Fast' },

  // Mercedes-Benz
  { make: 'Mercedes-Benz', model: 'EQS', batteryCapacity: 107, range: 770, chargingSpeed: 'Fast' },
  { make: 'Mercedes-Benz', model: 'EQE', batteryCapacity: 90, range: 639, chargingSpeed: 'Fast' },

  // Audi
  { make: 'Audi', model: 'e-tron', batteryCapacity: 95, range: 436, chargingSpeed: 'Fast' },

  // Polestar
  { make: 'Polestar', model: '2', batteryCapacity: 78, range: 540, chargingSpeed: 'Fast' },

  // Rivian
  { make: 'Rivian', model: 'R1T', batteryCapacity: 135, range: 505, chargingSpeed: 'Fast' },
];

/**
 * Find vehicle specs by make and model
 */
export function findVehicleSpecs(make: string, model: string): VehicleSpec | null {
  const normalized = EV_DATABASE.find(
    ev =>
      ev.make.toLowerCase() === make.toLowerCase() &&
      ev.model.toLowerCase().includes(model.toLowerCase())
  );
  return normalized || null;
}

/**
 * Get default vehicle specs if not found in database
 */
export function getDefaultVehicleSpecs(): VehicleSpec {
  return {
    make: 'Unknown',
    model: 'Unknown',
    batteryCapacity: 60, // Average EV battery
    range: 400, // Average range in km
    chargingSpeed: 'Fast',
  };
}

/**
 * Calculate remaining range based on current battery percentage
 */
export function calculateRemainingRange(batteryPercent: number, maxRange: number): number {
  return (maxRange * batteryPercent) / 100;
}

/**
 * Estimate battery consumption per km (simplified)
 * Average EV consumption is about 0.15-0.20 kWh/km
 */
export function estimateBatteryConsumption(distanceKm: number, batteryCapacity: number): number {
  const avgConsumptionRate = 0.17; // kWh per km
  const consumedKwh = distanceKm * avgConsumptionRate;
  const percentConsumed = (consumedKwh / batteryCapacity) * 100;
  return Math.min(percentConsumed, 100);
}

/**
 * Check if vehicle needs charging for a given distance
 */
export function needsCharging(
  currentBatteryPercent: number,
  distanceKm: number,
  vehicleRange: number,
  safetyBuffer: number = 20 // Keep 20% buffer
): boolean {
  const remainingRange = calculateRemainingRange(currentBatteryPercent, vehicleRange);
  const requiredRange = distanceKm * 1.1; // Add 10% for safety
  return remainingRange < requiredRange || currentBatteryPercent - safetyBuffer < 20;
}
