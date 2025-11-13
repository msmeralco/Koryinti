/**
 * Charging Stop Optimizer
 * Implements smart charging strategies similar to ABRP
 * - Minimize total trip time (multiple short stops)
 * - Minimize total cost (fewer stops, cheaper stations)
 * - Balance strategy based on user preferences
 */

import {
  STANDARD_VEHICLE,
  calculateBatteryConsumption,
  calculateChargingTime,
  CONSUMPTION_MULTIPLIERS,
  CHARGING_TARGET_PERCENT,
  MINIMUM_BATTERY_BUFFER,
} from './standardVehicleModel';
import { Station } from '@/types/navigation';

export interface ChargingStrategy {
  type: 'fastest' | 'cheapest' | 'balanced';
  maxStops: number;
  preferredChargingLevel: number; // Target % to charge to (60-90%)
  avoidSlowChargers: boolean;
}

export interface OptimizedStop {
  station: Station;
  arrivalBattery: number;
  departureBattery: number;
  chargingTime: number;
  cost: number;
  distanceFromStart: number;
}

/**
 * Optimize charging stops for fastest overall trip time
 * Strategy: Multiple short stops charging to 50-60% (fast charging zone)
 * Avoid charging above 80% (slow and inefficient)
 */
export function optimizeForSpeed(
  totalDistance: number,
  currentBattery: number,
  availableStations: Station[],
  minimumArrival: number = MINIMUM_BATTERY_BUFFER
): OptimizedStop[] {
  const stops: OptimizedStop[] = [];
  let currentSoC = currentBattery;
  let distanceCovered = 0;

  // Strategy: Charge to 55% at each stop (sweet spot for speed)
  const targetChargingLevel = 55;

  while (distanceCovered < totalDistance) {
    // Calculate how far we can go with current battery
    const batteryForTravel = currentSoC - minimumArrival;
    const maxDistance =
      ((batteryForTravel / 100) * STANDARD_VEHICLE.batteryCapacity) /
      (STANDARD_VEHICLE.avgConsumption * CONSUMPTION_MULTIPLIERS.demo);

    const remainingDistance = totalDistance - distanceCovered;

    // Do we need to charge?
    if (maxDistance < remainingDistance) {
      // Yes - find next charging stop
      const nextStopDistance = Math.min(maxDistance * 0.8, remainingDistance * 0.4);
      distanceCovered += nextStopDistance;

      // Battery at station
      const batteryUsed = calculateBatteryConsumption(
        nextStopDistance,
        CONSUMPTION_MULTIPLIERS.demo
      );
      const arrivalBattery = currentSoC - batteryUsed;

      // Find best station at this location (prefer high-power stations)
      const station = findBestStationForSpeed(availableStations, distanceCovered);

      if (!station) break; // No stations available

      // Charge to target level (or what we need, whichever is higher)
      const batteryNeeded =
        calculateBatteryConsumption(
          remainingDistance - nextStopDistance,
          CONSUMPTION_MULTIPLIERS.demo
        ) + minimumArrival;

      const departureBattery = Math.min(
        Math.max(targetChargingLevel, batteryNeeded),
        CHARGING_TARGET_PERCENT
      );

      const chargingTime = calculateChargingTime(
        arrivalBattery,
        departureBattery,
        station.powerKW || 50
      );

      stops.push({
        station,
        arrivalBattery,
        departureBattery,
        chargingTime,
        cost: 0, // Will be calculated later
        distanceFromStart: distanceCovered,
      });

      currentSoC = departureBattery;
    } else {
      // No charging needed, we can reach destination
      break;
    }
  }

  return stops;
}

/**
 * Optimize for lowest cost
 * Strategy: Fewer stops, charge to higher %, prefer cheaper stations
 */
export function optimizeForCost(
  totalDistance: number,
  currentBattery: number,
  availableStations: Station[],
  minimumArrival: number = MINIMUM_BATTERY_BUFFER
): OptimizedStop[] {
  const stops: OptimizedStop[] = [];
  let currentSoC = currentBattery;
  let distanceCovered = 0;

  // Strategy: Charge to 85% (fewer stops, despite slower charging)
  const targetChargingLevel = 85;

  while (distanceCovered < totalDistance) {
    const batteryForTravel = currentSoC - minimumArrival;
    const maxDistance =
      ((batteryForTravel / 100) * STANDARD_VEHICLE.batteryCapacity) /
      (STANDARD_VEHICLE.avgConsumption * CONSUMPTION_MULTIPLIERS.demo);

    const remainingDistance = totalDistance - distanceCovered;

    if (maxDistance < remainingDistance) {
      // Need to charge - go as far as possible before stopping
      const nextStopDistance = Math.min(maxDistance * 0.9, remainingDistance * 0.5);
      distanceCovered += nextStopDistance;

      const batteryUsed = calculateBatteryConsumption(
        nextStopDistance,
        CONSUMPTION_MULTIPLIERS.demo
      );
      const arrivalBattery = currentSoC - batteryUsed;

      // Find cheapest station
      const station = findCheapestStation(availableStations, distanceCovered);

      if (!station) break;

      const departureBattery = Math.min(targetChargingLevel, CHARGING_TARGET_PERCENT);

      const chargingTime = calculateChargingTime(
        arrivalBattery,
        departureBattery,
        station.powerKW || 50
      );

      stops.push({
        station,
        arrivalBattery,
        departureBattery,
        chargingTime,
        cost: 0,
        distanceFromStart: distanceCovered,
      });

      currentSoC = departureBattery;
    } else {
      break;
    }
  }

  return stops;
}

/**
 * Find best station for speed optimization
 * Prioritize: High power > Availability > Distance from route
 */
function findBestStationForSpeed(stations: Station[], targetDistance: number): Station | null {
  if (!stations.length) return null;

  // Score stations by power (higher is better)
  const scored = stations.map(station => ({
    station,
    score: (station.powerKW || 50) / 50, // Normalized by 50 kW baseline
  }));

  // Sort by score (highest power first)
  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.station || null;
}

/**
 * Find cheapest station
 * Prioritize: Low price > Power (still want reasonable speed)
 */
function findCheapestStation(stations: Station[], targetDistance: number): Station | null {
  if (!stations.length) return null;

  // Score by price (lower is better)
  const scored = stations.map(station => ({
    station,
    score: 50 / (station.pricePerKwh || 30), // Normalized
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.station || null;
}

/**
 * Calculate total trip time including charging
 */
export function calculateTotalTripTime(
  drivingTimeMinutes: number,
  chargingStops: OptimizedStop[]
): number {
  const totalChargingTime = chargingStops.reduce((sum, stop) => sum + stop.chargingTime, 0);
  return drivingTimeMinutes + totalChargingTime;
}

/**
 * Compare strategies and return the best one
 */
export function compareStrategies(
  totalDistance: number,
  currentBattery: number,
  availableStations: Station[],
  drivingTimeMinutes: number
): {
  fastest: { stops: OptimizedStop[]; totalTime: number };
  cheapest: { stops: OptimizedStop[]; totalTime: number; totalCost: number };
  recommended: 'fastest' | 'cheapest';
} {
  const fastestStops = optimizeForSpeed(totalDistance, currentBattery, availableStations);
  const cheapestStops = optimizeForCost(totalDistance, currentBattery, availableStations);

  const fastestTime = calculateTotalTripTime(drivingTimeMinutes, fastestStops);
  const cheapestTime = calculateTotalTripTime(drivingTimeMinutes, cheapestStops);

  // If time difference is less than 15 minutes, recommend cheapest
  const timeDifference = cheapestTime - fastestTime;
  const recommended = timeDifference < 15 ? 'cheapest' : 'fastest';

  return {
    fastest: { stops: fastestStops, totalTime: fastestTime },
    cheapest: { stops: cheapestStops, totalTime: cheapestTime, totalCost: 0 },
    recommended,
  };
}
