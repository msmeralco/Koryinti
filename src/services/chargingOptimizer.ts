/**
 * Charging Stop Optimizer - ABRP Style
 * Implements intelligent charging strategies based on user preferences
 * - Strategy 0: Few long stops (charge to 85%, minimize stop count)
 * - Strategy 1: Balanced (charge to 70%, balance time/convenience)
 * - Strategy 2: Many short stops (charge to 55%, fastest overall time)
 */

import {
  STANDARD_VEHICLE,
  calculateBatteryConsumption,
  calculateChargingTime,
  CONSUMPTION_MULTIPLIERS,
  CHARGING_TARGET_PERCENT,
  MINIMUM_BATTERY_BUFFER,
  interpolateChargeCurve,
} from './standardVehicleModel';
import { Station } from '@/types/navigation';

export type StrategyType = 0 | 1 | 2; // Few long, Balanced, Many short

export interface ChargingStrategy {
  targetSoC: number; // Target state of charge %
  minStopSoC: number; // Minimum SoC to arrive at station
  preferHighPower: boolean; // Prefer faster chargers
  description: string;
}

export interface OptimizedStop {
  station: Station;
  arrivalBattery: number;
  departureBattery: number;
  chargingTime: number;
  energyAdded: number; // kWh
  cost: number;
  distanceFromStart: number;
  reasonForStop: string;
}

export interface OptimizedRoute {
  stops: OptimizedStop[];
  totalChargingTime: number;
  totalCost: number;
  totalDistance: number;
  strategy: StrategyType;
  finalBattery: number;
}

/**
 * Get charging strategy parameters based on user preference
 */
export function getStrategy(type: StrategyType): ChargingStrategy {
  const strategies: Record<StrategyType, ChargingStrategy> = {
    0: {
      // Few but long stops
      targetSoC: 85,
      minStopSoC: 15,
      preferHighPower: false, // Cost matters more
      description: 'Fewer stops, charge to 80-90%',
    },
    1: {
      // Balanced
      targetSoC: 70,
      minStopSoC: 20,
      preferHighPower: true,
      description: 'Balanced approach',
    },
    2: {
      // Many but short stops
      targetSoC: 55,
      minStopSoC: 25,
      preferHighPower: true, // Speed matters most
      description: 'Quick stops, charge to 50-60%',
    },
  };
  
  return strategies[type];
}

/**
 * ABRP-style route optimization
 * Considers: Vehicle specs, charge curve, station power, pricing, traffic
 */
export function optimizeRoute(
  totalDistance: number,
  currentBattery: number,
  availableStations: Station[],
  minimumArrival: number,
  strategyType: StrategyType,
  trafficMultiplier: number = 1.0
): OptimizedRoute {
  const strategy = getStrategy(strategyType);
  const stops: OptimizedStop[] = [];
  
  let currentSoC = currentBattery;
  let distanceCovered = 0;
  let totalChargingTime = 0;
  let totalCost = 0;

  // Apply traffic multiplier to consumption
  const effectiveConsumption = STANDARD_VEHICLE.avgConsumption * CONSUMPTION_MULTIPLIERS.demo * trafficMultiplier;

  while (distanceCovered < totalDistance) {
    // Calculate maximum range with current battery
    const availableEnergy = ((currentSoC - strategy.minStopSoC) / 100) * STANDARD_VEHICLE.batteryCapacity;
    const maxRange = availableEnergy / effectiveConsumption;
    const remainingDistance = totalDistance - distanceCovered;

    // Do we need a charging stop?
    if (maxRange < remainingDistance) {
      // Yes - calculate optimal stop location
      // ABRP strategy: Don't drain to absolute minimum, stop with buffer
      const targetStopDistance = maxRange * 0.85; // Stop before getting too low
      const nextStopDistance = Math.min(targetStopDistance, remainingDistance);
      
      distanceCovered += nextStopDistance;

      // Calculate battery at arrival
      const energyUsed = nextStopDistance * effectiveConsumption;
      const batteryUsed = (energyUsed / STANDARD_VEHICLE.batteryCapacity) * 100;
      const arrivalBattery = currentSoC - batteryUsed;

      // Safety check
      if (arrivalBattery < strategy.minStopSoC) {
        console.warn('Route requires charging below safe minimum');
        break;
      }

      // Find best station for this strategy
      const station = selectBestStation(availableStations, distanceCovered, strategy, strategyType);
      
      if (!station) {
        console.warn('No suitable station found at', distanceCovered, 'km');
        break;
      }

      // Calculate optimal departure SoC
      const remainingAfterStop = totalDistance - distanceCovered;
      const energyNeededToDestination = (remainingAfterStop * effectiveConsumption) + 
        ((minimumArrival / 100) * STANDARD_VEHICLE.batteryCapacity);
      const socNeededToDestination = (energyNeededToDestination / STANDARD_VEHICLE.batteryCapacity) * 100;

      // Target SoC: enough to reach destination OR strategy target, whichever is appropriate
      let targetSoC: number;
      if (remainingAfterStop < maxRange * 0.5) {
        // Close to destination - charge just enough + buffer
        targetSoC = Math.min(socNeededToDestination + 10, strategy.targetSoC);
      } else {
        // Long way to go - use strategy target
        targetSoC = strategy.targetSoC;
      }

      // Cap at vehicle/station limits
      const departureBattery = Math.min(targetSoC, CHARGING_TARGET_PERCENT);

      // Calculate charging time using real charge curve
      const stationPower = Math.min(station.powerKW || 50, STANDARD_VEHICLE.maxChargingPower);
      const chargingTime = calculateChargingTime(arrivalBattery, departureBattery, stationPower);

      // Calculate energy and cost
      const energyAdded = ((departureBattery - arrivalBattery) / 100) * STANDARD_VEHICLE.batteryCapacity;
      const pricePerKwh = station.pricePerKwh || 0;
      const connectionFee = station.connectionFee || 25;
      const energyCost = energyAdded * pricePerKwh;
      const cost = energyCost + connectionFee;

      stops.push({
        station,
        arrivalBattery,
        departureBattery,
        chargingTime,
        energyAdded,
        cost,
        distanceFromStart: distanceCovered,
        reasonForStop: determineStopReason(arrivalBattery, strategy, remainingAfterStop),
      });

      totalChargingTime += chargingTime;
      totalCost += cost;
      currentSoC = departureBattery;
    } else {
      // No charging needed - can reach destination
      distanceCovered = totalDistance;
    }
  }

  const finalBattery = currentSoC - ((totalDistance - distanceCovered) * effectiveConsumption / STANDARD_VEHICLE.batteryCapacity * 100);

  return {
    stops,
    totalChargingTime,
    totalCost,
    totalDistance,
    strategy: strategyType,
    finalBattery,
  };
}

/**
 * Select best station based on strategy
 */
function selectBestStation(
  stations: Station[],
  targetDistance: number,
  strategy: ChargingStrategy,
  strategyType: StrategyType
): Station | null {
  if (!stations.length) return null;

  // Score each station
  const scored = stations.map(station => {
    let score = 0;
    const power = station.powerKW || 50;
    const price = station.pricePerKwh || 30;

    switch (strategyType) {
      case 0: // Few long stops - prioritize cost
        score = (30 / price) * 0.7 + (power / 250) * 0.3;
        break;
      case 1: // Balanced
        score = (power / 250) * 0.5 + (30 / price) * 0.5;
        break;
      case 2: // Many short stops - prioritize speed
        score = (power / 250) * 0.8 + (30 / price) * 0.2;
        break;
    }

    // Bonus for Tesla Superchargers (reliable, fast)
    if (station.isTeslaSupercharger) {
      score *= 1.2;
    }

    // Penalty for low availability
    if (station.availableChargers && station.totalChargers) {
      const availabilityRatio = station.availableChargers / station.totalChargers;
      score *= (0.5 + availabilityRatio * 0.5);
    }

    return { station, score };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.station || null;
}

/**
 * Determine why we're stopping at this station
 */
function determineStopReason(arrivalBattery: number, strategy: ChargingStrategy, remainingDistance: number): string {
  if (arrivalBattery < strategy.minStopSoC + 5) {
    return 'Low battery - necessary stop';
  }
  if (remainingDistance > 200) {
    return 'Long distance ahead';
  }
  return 'Optimal charging stop';
}

/**
 * Compare different strategies for user
 */
export function compareAllStrategies(
  totalDistance: number,
  currentBattery: number,
  availableStations: Station[],
  minimumArrival: number,
  drivingTimeMinutes: number,
  trafficMultiplier: number = 1.0
): {
  fewLong: OptimizedRoute & { totalTime: number };
  balanced: OptimizedRoute & { totalTime: number };
  manyShort: OptimizedRoute & { totalTime: number };
  recommended: StrategyType;
} {
  const strategies: StrategyType[] = [0, 1, 2];
  const results = strategies.map(type => {
    const route = optimizeRoute(totalDistance, currentBattery, availableStations, minimumArrival, type, trafficMultiplier);
    return {
      ...route,
      totalTime: drivingTimeMinutes + route.totalChargingTime,
    };
  });

  // Determine recommendation
  // If time difference between strategies is minimal (<15 min), recommend fewer stops
  // Otherwise recommend fastest
  const timeDiff = results[0].totalTime - results[2].totalTime;
  let recommended: StrategyType;
  
  if (Math.abs(timeDiff) < 15) {
    recommended = 0; // Few long stops if time is similar
  } else if (results[2].totalTime < results[0].totalTime) {
    recommended = 2; // Many short if significantly faster
  } else {
    recommended = 1; // Balanced as fallback
  }

  return {
    fewLong: results[0],
    balanced: results[1],
    manyShort: results[2],
    recommended,
  };
}
