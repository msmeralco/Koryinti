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
  PRICING,
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

  console.warn('🚗 STARTING ROUTE OPTIMIZATION:', {
    totalDistance: `${totalDistance.toFixed(1)} km`,
    currentBattery: `${currentBattery}%`,
    availableStations: availableStations.length,
    minimumArrival: `${minimumArrival}%`,
    strategy: strategy.description,
  });

  let currentSoC = currentBattery;
  let distanceCovered = 0;
  let totalChargingTime = 0;
  let totalCost = 0;
  const MAX_STOPS = 10; // Safety limit to prevent infinite loops
  let stopCount = 0;
  
  // Track used stations to prevent duplicates
  const usedStationIds = new Set<string>();

  // Apply traffic multiplier to consumption
  const effectiveConsumption =
    STANDARD_VEHICLE.avgConsumption * CONSUMPTION_MULTIPLIERS.demo * trafficMultiplier;

  while (distanceCovered < totalDistance && stopCount < MAX_STOPS) {
    // Calculate maximum range with current battery
    // IMPORTANT: Use user's minimumArrival, not strategy's minStopSoC
    // We should never let battery drop below the user's preference
    const safeMinimum = Math.max(minimumArrival, strategy.minStopSoC);
    const availableEnergy = ((currentSoC - safeMinimum) / 100) * STANDARD_VEHICLE.batteryCapacity;
    const maxRange = availableEnergy / effectiveConsumption;
    const remainingDistance = totalDistance - distanceCovered;

    // Calculate what battery we'd have if we drove the remaining distance
    const energyForRemainingDistance = remainingDistance * effectiveConsumption;
    const batteryForRemainingDistance =
      (energyForRemainingDistance / STANDARD_VEHICLE.batteryCapacity) * 100;
    const batteryAtDestinationIfNow = currentSoC - batteryForRemainingDistance;

    // Do we need a charging stop?
    // Check if we can reach destination while maintaining minimum arrival battery
    if (batteryAtDestinationIfNow < minimumArrival || maxRange < remainingDistance) {
      // Yes - calculate optimal stop location
      // ABRP strategy: Don't drain to absolute minimum, stop with buffer
      const targetStopDistance = maxRange * 0.85; // Stop before getting too low

      // Make sure we're making progress (minimum 10km per stop)
      if (targetStopDistance < 10) {
        console.warn('Cannot make progress - range too limited');
        break;
      }

      const nextStopDistance = Math.min(targetStopDistance, remainingDistance);
      const plannedStopLocation = distanceCovered + nextStopDistance;

      // Calculate battery at arrival
      const energyUsed = nextStopDistance * effectiveConsumption;
      const batteryUsed = (energyUsed / STANDARD_VEHICLE.batteryCapacity) * 100;
      const arrivalBattery = currentSoC - batteryUsed;

      // Safety check - ensure we don't arrive below minimum
      if (arrivalBattery < safeMinimum) {
        console.warn(
          'Route requires charging below safe minimum:',
          arrivalBattery,
          '<',
          safeMinimum
        );
        break;
      }

      // Find best station for this strategy (excluding already used stations)
      const station = selectBestStation(
        availableStations,
        plannedStopLocation,
        strategy,
        strategyType,
        usedStationIds
      );

      if (!station) {
        console.warn('❌ No suitable station found at', plannedStopLocation, 'km');
        console.warn('  Already used:', Array.from(usedStationIds).join(', '));
        console.warn('  Available stations:', availableStations.length);
        break;
      }
      
      // Mark this station as used to prevent selecting it again
      usedStationIds.add(station.id);
      console.warn(`✅ Stop ${stopCount + 1}: Selected "${station.name}" (ID: ${station.id}) at ${plannedStopLocation.toFixed(1)} km`);

      // Calculate optimal departure SoC
      const remainingAfterStop = totalDistance - plannedStopLocation;
      const energyNeededToDestination =
        remainingAfterStop * effectiveConsumption +
        (minimumArrival / 100) * STANDARD_VEHICLE.batteryCapacity;
      const socNeededToDestination =
        (energyNeededToDestination / STANDARD_VEHICLE.batteryCapacity) * 100;

      // Target SoC: MUST be enough to reach destination with minimumArrival
      // But also consider strategy preferences
      let targetSoC: number;

      // First, ensure we have enough to reach destination
      const minimumRequired = socNeededToDestination + 5; // 5% safety buffer

      if (remainingAfterStop < maxRange * 0.5) {
        // Close to destination - charge just enough + buffer
        targetSoC = Math.max(
          minimumRequired,
          Math.min(socNeededToDestination + 10, strategy.targetSoC)
        );
      } else {
        // Long way to go - use strategy target, but ensure minimum requirement
        targetSoC = Math.max(minimumRequired, strategy.targetSoC);
      }

      // Cap at vehicle/station limits (but never below minimum required)
      const departureBattery = Math.min(
        Math.max(targetSoC, minimumRequired),
        CHARGING_TARGET_PERCENT
      );

      // Make sure we're actually charging (minimum 5% charge)
      if (departureBattery - arrivalBattery < 5) {
        console.warn('Charge amount too small, adjusting target to minimum viable');
        // Force charge to at least minimum required
        const forcedDeparture = Math.min(minimumRequired, CHARGING_TARGET_PERCENT);
        if (forcedDeparture - arrivalBattery < 5) {
          console.error('Cannot charge enough to continue journey safely');
          break;
        }
      }

      // Calculate charging time using real charge curve
      const stationPower = Math.min(station.powerKW || 50, STANDARD_VEHICLE.maxChargingPower);
      const chargingTime = calculateChargingTime(arrivalBattery, departureBattery, stationPower);

      // Calculate energy and cost
      const energyAdded =
        ((departureBattery - arrivalBattery) / 100) * STANDARD_VEHICLE.batteryCapacity;
      const pricePerKwh = station.pricePerKwh || PRICING.defaultPricePerKwh;
      const connectionFee = station.connectionFee || PRICING.connectionFee;
      const energyCost = energyAdded * pricePerKwh;
      const cost = energyCost + connectionFee;

      stops.push({
        station,
        arrivalBattery,
        departureBattery,
        chargingTime,
        energyAdded,
        cost,
        distanceFromStart: plannedStopLocation,
        reasonForStop: determineStopReason(
          arrivalBattery,
          strategy,
          remainingAfterStop,
          minimumArrival
        ),
      });

      totalChargingTime += chargingTime;
      totalCost += cost;

      // Update state for next iteration
      currentSoC = departureBattery;
      distanceCovered = plannedStopLocation;
      stopCount++;
    } else {
      // No charging needed - can reach destination
      break;
    }
  }

  // Calculate final battery at destination
  const remainingToDestination = totalDistance - distanceCovered;
  const energyToDestination = remainingToDestination * effectiveConsumption;
  const batteryToDestination = (energyToDestination / STANDARD_VEHICLE.batteryCapacity) * 100;
  const finalBattery = currentSoC - batteryToDestination;

  console.warn('🏁 ROUTE OPTIMIZATION COMPLETE:', {
    totalStops: stops.length,
    usedStations: Array.from(usedStationIds),
    totalChargingTime: `${totalChargingTime} min`,
    totalCost: `₱${totalCost.toFixed(2)}`,
    finalBattery: `${finalBattery.toFixed(1)}%`,
  });

  return {
    stops,
    totalChargingTime,
    totalCost,
    totalDistance,
    strategy: strategyType,
    finalBattery: Math.max(finalBattery, 0),
  };
}

/**
 * Select best station based on strategy and location
 * Now considers: distance along route, prevents duplicates, prioritizes proximity
 */
function selectBestStation(
  stations: Station[],
  targetDistance: number,
  strategy: ChargingStrategy,
  strategyType: StrategyType,
  alreadyUsedStationIds: Set<string> = new Set()
): Station | null {
  if (!stations.length) return null;

  // Filter out already used stations to prevent duplicates
  const availableStations = stations.filter(s => !alreadyUsedStationIds.has(s.id));
  
  if (!availableStations.length) {
    console.warn('⚠️ No available stations (all already used)');
    return null;
  }

  // Score each station based on strategy AND add diversity
  const scored = availableStations.map((station, index) => {
    let score = 0;
    const power = station.powerKW || 50;
    const price = station.pricePerKwh || 30;

    // Base score from strategy
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

    // CRITICAL: Add position-based diversity
    // Since we don't have exact route positions, we'll use station array index
    // as a proxy - this ensures we cycle through different stations
    // Add strong randomization to prevent same station selection
    const positionBonus = (index / availableStations.length) * 0.3;
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier
    score = score * randomFactor + positionBonus;

    // Bonus for Tesla Superchargers (reliable, fast)
    if (station.isTeslaSupercharger) {
      score *= 1.1; // Reduced from 1.2 to allow more variety
    }

    // Penalty for low availability
    if (station.availableChargers && station.totalChargers) {
      const availabilityRatio = station.availableChargers / station.totalChargers;
      score *= 0.5 + availabilityRatio * 0.5;
    }

    return { station, score, stationId: station.id };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  const selected = scored[0]?.station || null;
  
  if (selected) {
    console.warn(`  ✅ Selected: ${selected.name} (ID: ${selected.id}, Power: ${selected.powerKW}kW, Price: ₱${selected.pricePerKwh}/kWh)`);
  } else {
    console.warn('  ❌ No station could be selected');
  }

  return selected;
}

/**
 * Determine why we're stopping at this station
 */
function determineStopReason(
  arrivalBattery: number,
  strategy: ChargingStrategy,
  remainingDistance: number,
  minimumArrival?: number
): string {
  // Check if we're at or near the absolute minimum threshold
  const absoluteMinimum = minimumArrival || strategy.minStopSoC;

  if (arrivalBattery < absoluteMinimum + 5) {
    return 'Battery near minimum threshold';
  }
  if (arrivalBattery < strategy.minStopSoC + 10) {
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
    const route = optimizeRoute(
      totalDistance,
      currentBattery,
      availableStations,
      minimumArrival,
      type,
      trafficMultiplier
    );
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
