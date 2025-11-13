/**
 * Standard Base Vehicle Model
 * Used for all route calculations when real vehicle API is not connected
 *
 * Baseline: Tesla Model 3 Long Range (2023)
 * - Industry-standard vehicle for EV infrastructure compatibility
 * - Widely available charging network support
 * - Realistic performance metrics for Philippine conditions
 */

export interface StandardVehicle {
  name: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number; // kWh
  maxRange: number; // km on full charge
  avgConsumption: number; // kWh per km
  fastChargingPower: number; // kW (max DC fast charging)
  standardChargingPower: number; // kW (max AC charging)
  supportedPlugs: ChargingPlug[]; // Compatible connector types
  maxChargingPower: number; // kW (absolute maximum the vehicle can accept)
  chargeCurve: ChargeCurvePoint[]; // Realistic charging curve (power vs SoC)
}

/**
 * Charging curve point - defines charging power at specific battery percentage
 */
export interface ChargeCurvePoint {
  socPercent: number; // State of Charge percentage (0-100)
  chargingPowerKW: number; // Maximum charging power at this SoC level
}

/**
 * Charging plug/connector types
 * Based on Philippine EV charging infrastructure standards
 */
export enum ChargingPlug {
  // AC Charging (Slow/Standard)
  TYPE_2 = 'Type 2', // Most common in PH, EU standard (Mennekes)
  TYPE_1 = 'Type 1', // J1772, North American standard

  // DC Fast Charging
  CCS2 = 'CCS2', // Combined Charging System (Type 2 + DC pins)
  CHADEMO = 'CHAdeMO', // Japanese standard (Nissan, older EVs)
  GB_T = 'GB/T', // Chinese standard
  TESLA = 'Tesla Supercharger', // Tesla proprietary (with adapter)
}

/**
 * Charging speed categories
 */
export enum ChargingSpeed {
  SLOW = 'Slow', // AC Level 1/2: 3-22 kW
  FAST = 'Fast', // DC Fast: 25-100 kW
  ULTRA_FAST = 'Ultra Fast', // DC Ultra: 100-350 kW
}

/**
 * Charging speed thresholds (kW)
 */
export const CHARGING_SPEED_THRESHOLDS = {
  SLOW_MAX: 22, // Up to 22 kW = Slow/Standard AC
  FAST_MAX: 100, // 22-100 kW = Fast DC
  ULTRA_FAST_MIN: 100, // 100+ kW = Ultra Fast DC
};

/**
 * Standard base vehicle: Tesla Model 3 Long Range (2023)
 * - Battery: 82 kWh (LFP or NMC depending on market)
 * - Range: ~580 km WLTP (realistic Philippine conditions)
 * - Charging: CCS2 up to 250 kW (limited by charger availability)
 * - Common in PH market, excellent charging infrastructure support
 *
 * Charge Curve Data: Based on real-world Tesla Model 3 LR charging tests
 * - Peak power: 250 kW (0-40% SoC)
 * - Tapers gradually from 40% onwards
 * - Significantly slower above 80% (battery protection)
 */
export const STANDARD_VEHICLE: StandardVehicle = {
  name: 'Tesla Model 3 Long Range',
  make: 'Tesla',
  model: 'Model 3',
  year: 2023,
  batteryCapacity: 82, // kWh
  maxRange: 580, // km (realistic estimate from 363 miles EPA)
  avgConsumption: 0.141, // kWh/km (82 kWh / 580 km)
  fastChargingPower: 250, // kW (Tesla Supercharger V3 capability)
  standardChargingPower: 11, // kW (Tesla Wall Connector / Type 2)
  supportedPlugs: [
    ChargingPlug.CCS2, // Primary DC fast charging in PH/Asia
    ChargingPlug.TYPE_2, // Standard AC charging
    ChargingPlug.TESLA, // Tesla Supercharger network
  ],
  maxChargingPower: 250, // kW (vehicle's maximum charging capability)

  // Realistic charging curve based on Tesla Model 3 LR field data
  // Source: Real-world charging tests, Tesla specs, and ABRP data
  chargeCurve: [
    { socPercent: 0, chargingPowerKW: 250 }, // 0-10%: Maximum power
    { socPercent: 10, chargingPowerKW: 250 }, // Still at peak
    { socPercent: 20, chargingPowerKW: 250 }, // Holding 250 kW
    { socPercent: 30, chargingPowerKW: 240 }, // Slight taper begins
    { socPercent: 40, chargingPowerKW: 200 }, // Noticeable taper
    { socPercent: 50, chargingPowerKW: 140 }, // Significant slowdown
    { socPercent: 60, chargingPowerKW: 100 }, // Moderate speed
    { socPercent: 70, chargingPowerKW: 70 }, // Slowing down
    { socPercent: 80, chargingPowerKW: 50 }, // Very slow (battery protection)
    { socPercent: 90, chargingPowerKW: 30 }, // Minimal power
    { socPercent: 95, chargingPowerKW: 20 }, // Trickle charge
    { socPercent: 100, chargingPowerKW: 15 }, // Final trickle
  ],
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
  demo: 2.8, // Aggressive consumption for demo/presentation purposes to showcase charging needs
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
 * Pricing constants based on Philippine EV charging market (2024-2025)
 * Data sources: DOE Unbundling, Shell Recharge, Tesla Supercharger, ACMobility
 */
export const PRICING = {
  // Per-kWh rates by charging speed (PHP)
  slowChargingRate: 25.0, // AC ≤22 kW (DOE avg: ₱23.6, Shell: ₱28, Tesla: ₱16)
  fastChargingRate: 33.0, // DC 50-100 kW (DOE avg: ₱33.81, ACMobility: ₱35)
  ultraFastChargingRate: 38.0, // DC ≥150 kW (Shell 180kW: ₱35, premium tier)

  // Tesla Supercharger specific rates (significantly cheaper)
  teslaSuperchargerRate: 19.0, // ₱19/kWh for DC rapid (actual Tesla pricing)

  // Session fees
  connectionFee: 25.0, // ₱25 per charging session (Solarius: ₱30, standardized lower)
  bookingFee: 30.0, // Flat ₱30 booking fee per trip
  commissionFeeRate: 0.02, // 2% commission on charging cost
  serviceFee: 0.0, // Removed per trip service fee

  // Idle fees (future implementation)
  idleFeePerMinute: 2.0, // ₱2/min after grace period
  idleFeeGracePeriod: 60, // 60 minutes before idle fees apply

  // Fallback pricing
  defaultPricePerKwh: 30.0, // ₱30/kWh if station doesn't specify (market average)
};

/**
 * Determine charging speed category based on power (kW)
 */
export function getChargingSpeedCategory(powerKW: number): ChargingSpeed {
  if (powerKW <= CHARGING_SPEED_THRESHOLDS.SLOW_MAX) {
    return ChargingSpeed.SLOW;
  } else if (powerKW <= CHARGING_SPEED_THRESHOLDS.FAST_MAX) {
    return ChargingSpeed.FAST;
  } else {
    return ChargingSpeed.ULTRA_FAST;
  }
}

/**
 * Get price per kWh based on charging speed and station type
 * @param powerKW Charging station power in kW
 * @param isTeslaSupercharger Whether this is a Tesla Supercharger
 * @param stationPricePerKwh Station-specific price (if available)
 * @returns Price per kWh in PHP
 */
export function getPricePerKwh(
  powerKW: number,
  isTeslaSupercharger: boolean = false,
  stationPricePerKwh?: number
): number {
  // Use station-specific price if provided
  if (stationPricePerKwh && stationPricePerKwh > 0) {
    return stationPricePerKwh;
  }

  // Tesla Supercharger gets special pricing
  if (isTeslaSupercharger) {
    return PRICING.teslaSuperchargerRate;
  }

  // Determine price by charging speed
  const speedCategory = getChargingSpeedCategory(powerKW);

  switch (speedCategory) {
    case ChargingSpeed.SLOW:
      return PRICING.slowChargingRate;
    case ChargingSpeed.FAST:
      return PRICING.fastChargingRate;
    case ChargingSpeed.ULTRA_FAST:
      return PRICING.ultraFastChargingRate;
    default:
      return PRICING.defaultPricePerKwh;
  }
}

/**
 * Check if vehicle is compatible with charging plug type
 * @param plugType Charging station plug type
 * @returns True if vehicle supports this plug
 */
export function isPlugCompatible(plugType: string): boolean {
  const supportedPlugStrings = STANDARD_VEHICLE.supportedPlugs.map(plug => plug.toString());
  return supportedPlugStrings.includes(plugType);
}

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
 * @param currentBatteryPercent Current battery level (%)
 * @param tripDistanceKm Trip distance in kilometers
 * @param terrainMultiplier Consumption multiplier (default: demo mode)
 * @param minimumArrivalBattery Minimum battery required at destination (%)
 */
export function needsCharging(
  currentBatteryPercent: number,
  tripDistanceKm: number,
  terrainMultiplier: number = CONSUMPTION_MULTIPLIERS.demo,
  minimumArrivalBattery: number = MINIMUM_BATTERY_BUFFER
): boolean {
  // Calculate battery consumption using the specified multiplier
  const batteryUsed = calculateBatteryConsumption(tripDistanceKm, terrainMultiplier);
  const batteryAtDestination = currentBatteryPercent - batteryUsed;

  // Check if we'll have enough battery at destination
  return batteryAtDestination < minimumArrivalBattery;
}

/**
 * Calculate charging time needed using realistic charge curve
 * This replaces the old linear charging time calculation
 * @param currentPercent Current battery percentage
 * @param targetPercent Target battery percentage after charging
 * @param stationPowerKW Charging station power in kW (will be limited by vehicle curve)
 * @param chargeCurve Vehicle's charging curve (optional, uses STANDARD_VEHICLE if not provided)
 * @returns Charging time in minutes
 */
export function calculateChargingTime(
  currentPercent: number,
  targetPercent: number,
  stationPowerKW: number,
  chargeCurve: ChargeCurvePoint[] = STANDARD_VEHICLE.chargeCurve
): number {
  if (currentPercent >= targetPercent) return 0;

  let totalMinutes = 0;
  const stepSize = 1; // Calculate in 1% increments for accuracy

  // Integrate over the charge curve
  for (let soc = currentPercent; soc < targetPercent; soc += stepSize) {
    // Get maximum vehicle charging power at this SoC level
    const vehicleMaxPower = interpolateChargeCurve(chargeCurve, soc);

    // Actual charging power is limited by both station and vehicle
    const actualPower = Math.min(vehicleMaxPower, stationPowerKW);

    // Energy needed for this 1% step
    const kwhFor1Percent = (stepSize / 100) * STANDARD_VEHICLE.batteryCapacity;

    // Time for this step (in hours, then convert to minutes)
    const hoursForStep = kwhFor1Percent / actualPower;
    const minutesForStep = hoursForStep * 60;

    totalMinutes += minutesForStep;
  }

  return Math.ceil(totalMinutes);
}

/**
 * Interpolate charging power from charge curve at a specific SoC
 * Uses linear interpolation between curve points
 * @param chargeCurve Array of charge curve points
 * @param socPercent State of charge percentage to interpolate
 * @returns Interpolated charging power in kW
 */
export function interpolateChargeCurve(
  chargeCurve: ChargeCurvePoint[],
  socPercent: number
): number {
  // Handle edge cases
  if (socPercent <= chargeCurve[0].socPercent) {
    return chargeCurve[0].chargingPowerKW;
  }
  if (socPercent >= chargeCurve[chargeCurve.length - 1].socPercent) {
    return chargeCurve[chargeCurve.length - 1].chargingPowerKW;
  }

  // Find the two points to interpolate between
  for (let i = 0; i < chargeCurve.length - 1; i++) {
    const point1 = chargeCurve[i];
    const point2 = chargeCurve[i + 1];

    if (socPercent >= point1.socPercent && socPercent <= point2.socPercent) {
      // Linear interpolation
      const ratio = (socPercent - point1.socPercent) / (point2.socPercent - point1.socPercent);
      const interpolatedPower =
        point1.chargingPowerKW + ratio * (point2.chargingPowerKW - point1.chargingPowerKW);
      return interpolatedPower;
    }
  }

  // Fallback (shouldn't reach here)
  return chargeCurve[chargeCurve.length - 1].chargingPowerKW;
}

/**
 * Get optimal charging target percentage for fastest overall trip
 * Charging to 100% is slow - often better to charge to 60-70% and stop again
 * @param currentPercent Current battery percentage
 * @param distanceToNextStop Distance to next charging stop (or destination) in km
 * @param minimumArrival Minimum battery to arrive with
 * @returns Optimal target percentage to charge to
 */
export function getOptimalChargingTarget(
  currentPercent: number,
  distanceToNextStop: number,
  minimumArrival: number = MINIMUM_BATTERY_BUFFER
): number {
  // Calculate battery needed for the distance
  const consumptionForDistance = calculateBatteryConsumption(
    distanceToNextStop,
    CONSUMPTION_MULTIPLIERS.demo
  );
  const batteryNeeded = consumptionForDistance + minimumArrival;

  // Never charge past 90% unless absolutely necessary (too slow)
  const maxTarget = 90;

  // Charge to what we need, or 90%, whichever is lower
  const optimalTarget = Math.min(batteryNeeded, maxTarget);

  // But ensure we charge at least 10% (minimum worthwhile stop)
  const minTarget = currentPercent + 10;

  return Math.max(optimalTarget, minTarget);
}

/**
 * Calculate cost for charging
 * @param kwhCharged Amount of energy charged in kWh
 * @param pricePerKwh Station price per kWh (PHP)
 * @param includeConnectionFee Whether to include the one-time connection fee
 * @returns Total cost in PHP
 */
export function calculateChargingCost(
  kwhCharged: number,
  pricePerKwh: number,
  includeConnectionFee: boolean = true
): number {
  const energyCost = kwhCharged * pricePerKwh;
  const connectionFee = includeConnectionFee ? PRICING.connectionFee : 0;
  return energyCost + connectionFee;
}

/**
 * Get the standard vehicle instance
 */
export function getStandardVehicle(): StandardVehicle {
  return STANDARD_VEHICLE;
}
