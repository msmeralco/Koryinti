/**
 * Enhanced Route Calculation Engine
 * Handles detailed route planning with battery tracking, charging stops, and cost calculation
 */

import { searchPlaces } from './geocodingService';
import { calculateRoute as calculateOpenRoute, RouteResult } from './openRouteService';
import { searchStationsAlongRoute, filterStations } from './openChargeMapService';
import {
  getStandardVehicle,
  calculateBatteryConsumption,
  needsCharging,
  calculateChargingTime,
  calculateChargingCost,
  getPricePerKwh,
  getChargingSpeedCategory,
  MINIMUM_BATTERY_BUFFER,
  CHARGING_ARRIVAL_MIN,
  CHARGING_TARGET_PERCENT,
  PRICING,
  CONSUMPTION_MULTIPLIERS,
} from './standardVehicleModel';
import {
  DetailedRoute,
  RouteSegment,
  ChargingStop,
  CostBreakdown,
  RouteCalculationOptions,
  RouteCalculationResult,
  TurnInstruction,
} from '@/types/route-calculation';
import { Station } from '@/types/navigation';

/**
 * Main function to calculate a detailed route with all segments and charging stops
 */
export async function calculateDetailedRoute(
  options: RouteCalculationOptions
): Promise<RouteCalculationResult> {
  try {
    const {
      from,
      to,
      currentBatteryPercent = 80,
      preferFastChargers = true,
      maxDetourKm = 5,
      minimumArrivalBattery = MINIMUM_BATTERY_BUFFER,
    } = options;

    // Step 1: Geocode addresses to coordinates
    const [fromResults, toResults] = await Promise.all([searchPlaces(from), searchPlaces(to)]);

    if (!fromResults.length || !toResults.length) {
      return {
        success: false,
        error: 'Could not find coordinates for the provided addresses',
      };
    }

    const fromCoords = {
      latitude: parseFloat(fromResults[0].lat),
      longitude: parseFloat(fromResults[0].lon),
    };
    const toCoords = {
      latitude: parseFloat(toResults[0].lat),
      longitude: parseFloat(toResults[0].lon),
    };

    // Step 2: Calculate base route using OpenRouteService
    const routeData: RouteResult = await calculateOpenRoute(fromCoords, toCoords, true, false);

    // Step 3: Check if charging is needed
    // Using DEMO mode with aggressive battery degradation for presentation
    const vehicle = getStandardVehicle();
    const requiresCharging = needsCharging(
      currentBatteryPercent,
      routeData.distance,
      CONSUMPTION_MULTIPLIERS.demo,
      minimumArrivalBattery
    );

    // Debug logging
    const batteryUsed = calculateBatteryConsumption(
      routeData.distance,
      CONSUMPTION_MULTIPLIERS.demo
    );
    const batteryAtDestination = currentBatteryPercent - batteryUsed;
    console.warn('🔋 Battery Calculation:', {
      currentBattery: `${currentBatteryPercent}%`,
      distance: `${routeData.distance.toFixed(2)} km`,
      batteryUsed: `${batteryUsed.toFixed(2)}%`,
      batteryAtDestination: `${batteryAtDestination.toFixed(2)}%`,
      minimumRequired: `${minimumArrivalBattery}%`,
      requiresCharging,
    });

    // Step 4: Find charging stations if needed
    let chargingStations: Station[] = [];
    if (requiresCharging) {
      const rawStations = await searchStationsAlongRoute(routeData.geometry, maxDetourKm);
      console.warn(`🔍 Found ${rawStations.length} raw charging stations`);
      const filtered = filterStations(rawStations, {
        onlyAvailable: false, // Don't filter by availability - many stations don't report this
        onlyFastChargers: false, // Accept all chargers for demo
        minPowerKW: undefined, // No minimum power requirement for demo
      });
      console.warn(`✅ Filtered to ${filtered.length} suitable charging stations`);
      chargingStations = convertStationsToAppFormat(filtered);
    }

    // Step 5: Plan optimal charging stops
    const { segments, chargingStops } = planRouteSegments(
      from,
      to,
      fromCoords,
      toCoords,
      routeData,
      currentBatteryPercent,
      chargingStations,
      minimumArrivalBattery
    );

    // Step 6: Calculate costs
    const costBreakdown = calculateCosts(chargingStops);

    // Step 7: Build detailed route object
    // Using aggressive demo consumption multiplier
    const totalChargingTime = chargingStops.reduce((sum, stop) => sum + stop.chargingDuration, 0);
    const totalEnergyCharged = chargingStops.reduce((sum, stop) => sum + stop.energyCharged, 0);
    const totalEnergyUsed =
      ((routeData.distance * vehicle.avgConsumption * CONSUMPTION_MULTIPLIERS.demo) /
        vehicle.batteryCapacity) *
      100;

    const finalBattery =
      currentBatteryPercent +
      chargingStops.reduce((sum, stop) => sum + (stop.departureBattery - stop.arrivalBattery), 0) -
      calculateBatteryConsumption(routeData.distance, CONSUMPTION_MULTIPLIERS.demo);

    const detailedRoute: DetailedRoute = {
      id: `route-${Date.now()}`,
      from,
      to,
      segments,
      chargingStops,
      polyline: routeData.geometry,
      totalDistance: Math.round(routeData.distance),
      totalTravelTime: Math.round(routeData.duration),
      totalChargingTime,
      totalDuration: Math.round(routeData.duration + totalChargingTime),
      costBreakdown,
      initialBattery: currentBatteryPercent,
      finalBattery: Math.max(finalBattery, 0),
      totalEnergyUsed,
      totalEnergyCharged,
      createdAt: new Date(),
    };

    return {
      success: true,
      route: detailedRoute,
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Plan route segments with battery tracking and charging stops
 */
function planRouteSegments(
  from: string,
  to: string,
  fromCoords: { latitude: number; longitude: number },
  toCoords: { latitude: number; longitude: number },
  routeData: RouteResult,
  initialBattery: number,
  availableStations: Station[],
  minimumArrivalBattery: number
): { segments: RouteSegment[]; chargingStops: ChargingStop[] } {
  const segments: RouteSegment[] = [];
  const chargingStops: ChargingStop[] = [];
  const vehicle = getStandardVehicle();

  const currentBattery = initialBattery;
  let cumulativeDistance = 0;
  let cumulativeDuration = 0;

  // Segment 1: Starting point
  segments.push({
    id: `segment-0`,
    order: 0,
    type: 'start',
    location: from,
    coordinates: fromCoords,
    distanceFromPrevious: 0,
    durationFromPrevious: 0,
    cumulativeDistance: 0,
    cumulativeDuration: 0,
    batteryAtArrival: currentBattery,
    batteryAtDeparture: currentBattery,
  });

  // Check if we need charging stops
  const batteryNeeded = calculateBatteryConsumption(
    routeData.distance,
    CONSUMPTION_MULTIPLIERS.demo // Use aggressive demo consumption
  );
  const batteryAtDestination = currentBattery - batteryNeeded;

  if (batteryAtDestination >= minimumArrivalBattery) {
    // No charging needed - direct route
    const travelInstructions = extractTravelInstructions(routeData);

    segments.push({
      id: `segment-1`,
      order: 1,
      type: 'travel',
      location: `Traveling to ${to}`,
      coordinates: toCoords,
      distanceFromPrevious: routeData.distance,
      durationFromPrevious: routeData.duration,
      cumulativeDistance: routeData.distance,
      cumulativeDuration: routeData.duration,
      batteryAtArrival: Math.max(batteryAtDestination, 0),
      instructions: travelInstructions,
    });

    segments.push({
      id: `segment-2`,
      order: 2,
      type: 'destination',
      location: to,
      coordinates: toCoords,
      distanceFromPrevious: 0,
      durationFromPrevious: 0,
      cumulativeDistance: routeData.distance,
      cumulativeDuration: routeData.duration,
      batteryAtArrival: Math.max(batteryAtDestination, 0),
    });
  } else {
    // Need charging - find optimal stop(s)
    const optimalStation = findOptimalChargingStation(
      availableStations,
      fromCoords,
      toCoords,
      routeData.distance,
      currentBattery
    );

    if (optimalStation) {
      // Calculate distance to charging station (approximate as midpoint for now)
      const distanceToStation = routeData.distance * 0.4; // Roughly 40% of the way
      const durationToStation = routeData.duration * 0.4;
      const batteryAtStation =
        currentBattery -
        calculateBatteryConsumption(distanceToStation, CONSUMPTION_MULTIPLIERS.demo);

      cumulativeDistance += distanceToStation;
      cumulativeDuration += durationToStation;

      // Travel segment to charging station
      segments.push({
        id: `segment-1`,
        order: 1,
        type: 'travel',
        location: `Traveling to ${optimalStation.name}`,
        coordinates: {
          latitude: optimalStation.latitude,
          longitude: optimalStation.longitude,
        },
        distanceFromPrevious: distanceToStation,
        durationFromPrevious: durationToStation,
        cumulativeDistance,
        cumulativeDuration,
        batteryAtArrival: Math.max(batteryAtStation, CHARGING_ARRIVAL_MIN),
        instructions: extractTravelInstructions(routeData, 0, 0.4),
      });

      // Charging stop
      // Cap station power to vehicle's maximum charging capability
      const rawStationPower = optimalStation.powerKW || vehicle.fastChargingPower;
      const stationPowerKW = Math.min(rawStationPower, vehicle.maxChargingPower);

      const chargingDuration = calculateChargingTime(
        batteryAtStation,
        CHARGING_TARGET_PERCENT,
        stationPowerKW
      );
      const energyCharged =
        ((CHARGING_TARGET_PERCENT - batteryAtStation) / 100) * vehicle.batteryCapacity;

      // Calculate dynamic pricing based on charging speed and station type
      const dynamicPricePerKwh = getPricePerKwh(
        stationPowerKW,
        optimalStation.isTeslaSupercharger || false,
        optimalStation.pricePerKwh
      );

      // Calculate total charging cost (includes connection fee)
      const chargingCost = calculateChargingCost(energyCharged, dynamicPricePerKwh, true);

      // Update station price for display
      optimalStation.pricePerKwh = dynamicPricePerKwh;

      // Determine charging speed category for display
      const speedCategory = getChargingSpeedCategory(stationPowerKW);
      optimalStation.chargingSpeed = speedCategory;

      // Debug logging for pricing
      console.warn('💰 Charging Cost Breakdown:', {
        stationPower: `${stationPowerKW} kW`,
        speedCategory,
        pricePerKwh: `₱${dynamicPricePerKwh}/kWh`,
        energyCharged: `${energyCharged.toFixed(2)} kWh`,
        energyCost: `₱${(energyCharged * dynamicPricePerKwh).toFixed(2)}`,
        connectionFee: `₱${PRICING.connectionFee}`,
        totalChargingCost: `₱${chargingCost.toFixed(2)}`,
        chargingTime: `${chargingDuration} minutes`,
      });

      cumulativeDuration += chargingDuration;

      segments.push({
        id: `segment-2`,
        order: 2,
        type: 'charging_station',
        location: optimalStation.name,
        coordinates: {
          latitude: optimalStation.latitude,
          longitude: optimalStation.longitude,
        },
        distanceFromPrevious: 0,
        durationFromPrevious: 0,
        cumulativeDistance,
        cumulativeDuration,
        batteryAtArrival: Math.max(batteryAtStation, CHARGING_ARRIVAL_MIN),
        batteryAtDeparture: CHARGING_TARGET_PERCENT,
        chargingStation: optimalStation,
        chargingDuration,
        energyCharged,
        chargingCost,
      });

      chargingStops.push({
        segmentId: `segment-2`,
        station: optimalStation,
        arrivalBattery: Math.max(batteryAtStation, CHARGING_ARRIVAL_MIN),
        departureBattery: CHARGING_TARGET_PERCENT,
        chargingDuration,
        energyCharged,
        cost: chargingCost,
        distanceFromStart: cumulativeDistance,
        reasonForStop: 'Battery optimization for remaining distance',
      });

      // Final leg to destination
      const remainingDistance = routeData.distance - distanceToStation;
      const remainingDuration = routeData.duration - durationToStation;
      const batteryForRemaining = calculateBatteryConsumption(
        remainingDistance,
        CONSUMPTION_MULTIPLIERS.demo
      );
      const finalBattery = CHARGING_TARGET_PERCENT - batteryForRemaining;

      cumulativeDistance += remainingDistance;
      cumulativeDuration += remainingDuration;

      segments.push({
        id: `segment-3`,
        order: 3,
        type: 'travel',
        location: `Traveling to ${to}`,
        coordinates: toCoords,
        distanceFromPrevious: remainingDistance,
        durationFromPrevious: remainingDuration,
        cumulativeDistance,
        cumulativeDuration,
        batteryAtArrival: Math.max(finalBattery, 0),
        instructions: extractTravelInstructions(routeData, 0.4, 1.0),
      });

      segments.push({
        id: `segment-4`,
        order: 4,
        type: 'destination',
        location: to,
        coordinates: toCoords,
        distanceFromPrevious: 0,
        durationFromPrevious: 0,
        cumulativeDistance,
        cumulativeDuration,
        batteryAtArrival: Math.max(finalBattery, 0),
      });
    } else {
      // No suitable charging station found - still create route but with warning
      segments.push({
        id: `segment-1`,
        order: 1,
        type: 'travel',
        location: `Traveling to ${to}`,
        coordinates: toCoords,
        distanceFromPrevious: routeData.distance,
        durationFromPrevious: routeData.duration,
        cumulativeDistance: routeData.distance,
        cumulativeDuration: routeData.duration,
        batteryAtArrival: Math.max(batteryAtDestination, 0),
        instructions: extractTravelInstructions(routeData),
      });

      segments.push({
        id: `segment-2`,
        order: 2,
        type: 'destination',
        location: to,
        coordinates: toCoords,
        distanceFromPrevious: 0,
        durationFromPrevious: 0,
        cumulativeDistance: routeData.distance,
        cumulativeDuration: routeData.duration,
        batteryAtArrival: Math.max(batteryAtDestination, 0),
      });
    }
  }

  return { segments, chargingStops };
}

/**
 * Extract travel instructions from route data
 */
function extractTravelInstructions(
  routeData: RouteResult,
  startFraction: number = 0,
  endFraction: number = 1
): TurnInstruction[] {
  if (!routeData.segments || routeData.segments.length === 0) {
    // Generate basic instructions if API doesn't provide them
    return [
      {
        type: 'depart',
        instruction: 'Depart from origin',
        distance: 0,
        duration: 0,
      },
      {
        type: 'continue_straight',
        instruction: 'Continue on route',
        distance: routeData.distance * (endFraction - startFraction),
        duration: routeData.duration * (endFraction - startFraction),
      },
    ];
  }

  // Convert OpenRouteService steps to our format
  const instructions: TurnInstruction[] = [];
  const segment = routeData.segments[0];

  if (segment.steps) {
    for (const step of segment.steps) {
      instructions.push({
        type: mapStepTypeToTurnType(step.type),
        instruction: step.instruction,
        distance: step.distance / 1000, // Convert meters to km
        duration: step.duration / 60, // Convert seconds to minutes
        roadName: step.name,
        exitNumber: step.exitNumber,
      });
    }
  }

  return instructions;
}

/**
 * Map OpenRouteService step types to our TurnType
 */
function mapStepTypeToTurnType(stepType: number): TurnInstruction['type'] {
  // OpenRouteService step type codes
  const typeMap: Record<number, TurnInstruction['type']> = {
    0: 'turn_left',
    1: 'turn_right',
    2: 'turn_sharp_left',
    3: 'turn_sharp_right',
    4: 'turn_slight_left',
    5: 'turn_slight_right',
    6: 'continue_straight',
    7: 'enter_roundabout',
    8: 'exit_roundabout',
    9: 'u_turn',
    10: 'arrive_destination',
    11: 'depart',
    12: 'ramp',
  };

  return typeMap[stepType] || 'continue_straight';
}

/**
 * Find optimal charging station based on location and battery needs
 */
function findOptimalChargingStation(
  stations: Station[],
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  totalDistance: number,
  currentBattery: number
): Station | null {
  if (stations.length === 0) return null;

  // Calculate ideal charging point (around 40-60% of the route)
  const idealDistance = totalDistance * 0.5;

  // Score each station
  const scoredStations = stations.map(station => {
    const distanceFromOrigin = calculateDistance(from, {
      latitude: station.latitude,
      longitude: station.longitude,
    });
    const distanceToDestination = calculateDistance(
      { latitude: station.latitude, longitude: station.longitude },
      to
    );

    // Prefer stations near the midpoint
    const locationScore = 100 - Math.abs(distanceFromOrigin - idealDistance) * 2;

    // Prefer fast chargers
    const speedScore = station.chargingSpeed.includes('Fast') ? 50 : 20;

    // Prefer available chargers
    const availabilityScore = (station.availableChargers / station.totalChargers) * 30;

    // Prefer lower cost
    const costScore = Math.max(0, 20 - station.pricePerKwh);

    const totalScore = locationScore + speedScore + availabilityScore + costScore;

    return { station, score: totalScore };
  });

  // Sort by score and return best
  scoredStations.sort((a, b) => b.score - a.score);
  return scoredStations[0].station;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate total costs for the trip
 */
function calculateCosts(chargingStops: ChargingStop[]): CostBreakdown {
  const chargingCost = chargingStops.reduce((sum, stop) => sum + stop.cost, 0);
  const bookingFee = chargingCost * PRICING.bookingFeeRate;
  const totalCost = chargingCost + bookingFee;

  return {
    chargingCost: Math.round(chargingCost * 100) / 100,
    bookingFee: Math.round(bookingFee * 100) / 100,
    serviceFee: 0, // No service fee for presentation
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Convert OpenChargeMap stations to app format
 */
function convertStationsToAppFormat(stations: any[]): Station[] {
  return stations.map(station => ({
    id: station.id.toString(),
    name: station.name,
    address: station.address,
    latitude: station.latitude,
    longitude: station.longitude,
    availableChargers: station.isAvailable ? Math.max(1, station.numberOfPoints - 1) : 0,
    totalChargers: station.numberOfPoints || 2,
    chargingSpeed: station.isFastCharger ? `Fast (${station.powerKW || 50}kW)` : 'Standard (22kW)',
    pricePerKwh: 0, // Will be calculated dynamically based on charging speed
    amenities: ['Restroom', 'WiFi'],
    rating: 4.0,
    powerKW: station.powerKW || (station.isFastCharger ? 50 : 22),
  }));
}
