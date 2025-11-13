/**
 * Standard Base Vehicle Model
 * Used for all route calculations when real vehicle API is not connected
 *
 * This provides a realistic mid-range EV specification that represents
 * a typical electric vehicle for demonstration/presentation purposes.
 */

export interface StandardVehicle {
  name: string;
  batteryCapacity: number; // kWh
  maxRange: number; // km on full charge
  avgConsumption: number; // kWh per km
  fastChargingPower: number; // kW
  standardChargingPower: number; // kW
}

/**
 * Standard base vehicle specs (similar to BYD Atto 3 / Tesla Model 3 / MG4)
 * - Mid-range battery capacity
 * - Realistic consumption rate
 * - Common charging capabilities
 */
export const STANDARD_VEHICLE: StandardVehicle = {
  name: 'Standard EV Model',
  batteryCapacity: 60, // kWh - typical mid-range EV
  maxRange: 400, // km - realistic range on full charge
  avgConsumption: 0.15, // kWh/km - average efficiency (city + highway)
  fastChargingPower: 50, // kW - DC fast charging
  standardChargingPower: 22, // kW - AC Level 2 charging
};

/**
 * Consumption multipliers for different driving conditions
 */
export const CONSUMPTION_MULTIPLIERS = {
  city: 1.0, // Base consumption (lots of stops, lower speed)
  highway: 1.15, // Higher consumption at highway speeds
  uphill: 1.25, // Significant increase when climbing
  downhill: 0.85, // Regenerative braking benefit
  withAC: 1.08, // Air conditioning usage (future)
  coldWeather: 1.12, // Battery efficiency loss in cold (future)
};

/**
 * Safety buffer - minimum battery percentage to maintain at destination
 */
export const MINIMUM_BATTERY_BUFFER = 15; // %

/**
 * Charging safety margin - don't arrive at charging station below this
 */
export const CHARGING_ARRIVAL_MIN = 10; // %

/**
 * Target battery after charging (don't charge to 100% unnecessarily)
 */
export const CHARGING_TARGET_PERCENT = 90; // %

/**
 * Pricing constants
 */
export const PRICING = {
  bookingFeeRate: 0.02, // 2% of charging cost
  serviceFee: 5.0, // PHP flat fee per trip
  defaultPricePerKwh: 15.0, // PHP per kWh if station doesn't specify
};

/**
 * Calculate remaining range based on current battery percentage
 */
export function calculateRemainingRange(batteryPercent: number): number {
  return (STANDARD_VEHICLE.maxRange * batteryPercent) / 100;
}

/**
 * Calculate battery consumption for a given distance
 * @param distanceKm Distance in kilometers
 * @param terrainMultiplier Terrain factor (1.0 = flat, 1.25 = uphill, 0.85 = downhill)
 * @returns Battery percentage consumed
 */
export function calculateBatteryConsumption(
  distanceKm: number,
  terrainMultiplier: number = 1.0
): number {
  const consumption = STANDARD_VEHICLE.avgConsumption * terrainMultiplier;
  const kwhUsed = distanceKm * consumption;
  const percentUsed = (kwhUsed / STANDARD_VEHICLE.batteryCapacity) * 100;
  return Math.min(percentUsed, 100);
}

/**
 * Check if charging is needed for a trip
 */
export function needsCharging(currentBatteryPercent: number, tripDistanceKm: number): boolean {
  const availableRange = calculateRemainingRange(currentBatteryPercent);
  const requiredRange = tripDistanceKm * 1.1; // Add 10% safety margin

  // Check if we have enough range plus minimum buffer at destination
  const batteryUsed = calculateBatteryConsumption(tripDistanceKm);
  const batteryAtDestination = currentBatteryPercent - batteryUsed;

  return availableRange < requiredRange || batteryAtDestination < MINIMUM_BATTERY_BUFFER;
}

/**
 * Calculate charging time needed
 * @param currentPercent Current battery percentage
 * @param targetPercent Target battery percentage after charging
 * @param chargingPowerKW Charging station power in kW
 * @returns Charging time in minutes
 */
export function calculateChargingTime(
  currentPercent: number,
  targetPercent: number,
  chargingPowerKW: number
): number {
  const percentToCharge = targetPercent - currentPercent;
  const kwhToCharge = (percentToCharge / 100) * STANDARD_VEHICLE.batteryCapacity;

  // Charging efficiency decreases at higher battery levels
  // Apply efficiency curve (fast until 80%, then slower)
  let efficiency = 0.9;
  if (targetPercent > 80) {
    efficiency = 0.7; // Slower charging after 80%
  }

  const effectivePower = chargingPowerKW * efficiency;
  const hoursToCharge = kwhToCharge / effectivePower;
  const minutesToCharge = Math.ceil(hoursToCharge * 60);

  return Math.max(minutesToCharge, 5); // Minimum 5 minutes
}

/**
 * Calculate cost for charging
 * @param kwhCharged Amount of energy charged in kWh
 * @param pricePerKwh Station price per kWh (PHP)
 * @returns Total cost in PHP
 */
export function calculateChargingCost(kwhCharged: number, pricePerKwh: number): number {
  return kwhCharged * pricePerKwh;
}

/**
 * Get the standard vehicle instance
 */
export function getStandardVehicle(): StandardVehicle {
  return STANDARD_VEHICLE;
}
