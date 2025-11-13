/**
 * Type definitions for enhanced route calculation system
 */

import { Station } from './navigation';

/**
 * Types of route segments
 */
export type SegmentType = 'start' | 'travel' | 'charging_station' | 'destination';

/**
 * Turn instruction types from OpenRouteService
 */
export type TurnType =
  | 'turn_left'
  | 'turn_right'
  | 'turn_sharp_left'
  | 'turn_sharp_right'
  | 'turn_slight_left'
  | 'turn_slight_right'
  | 'continue_straight'
  | 'enter_roundabout'
  | 'exit_roundabout'
  | 'u_turn'
  | 'ramp'
  | 'fork'
  | 'merge'
  | 'arrive_destination'
  | 'depart';

/**
 * Individual turn-by-turn instruction
 */
export interface TurnInstruction {
  type: TurnType;
  instruction: string; // Human-readable instruction text
  distance: number; // Distance to this instruction in km
  duration: number; // Time to this instruction in minutes
  roadName?: string; // Name of the road (if available)
  exitNumber?: number; // For roundabouts/highway exits
}

/**
 * A single segment of the route
 * Can be a starting point, travel segment, charging stop, or destination
 */
export interface RouteSegment {
  id: string;
  order: number; // Sequence in the route (0 = start)
  type: SegmentType;

  // Location info
  location: string; // Name/address of this segment
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Distance and time from previous segment
  distanceFromPrevious: number; // km
  durationFromPrevious: number; // minutes

  // Cumulative totals
  cumulativeDistance: number; // Total km from start
  cumulativeDuration: number; // Total minutes from start (including charging)

  // Battery state
  batteryAtArrival: number; // Battery % when arriving at this point
  batteryAtDeparture?: number; // Battery % when leaving (for charging stops)

  // Turn-by-turn instructions (for travel segments)
  instructions?: TurnInstruction[];

  // Charging info (for charging station segments)
  chargingStation?: Station;
  chargingDuration?: number; // minutes
  energyCharged?: number; // kWh
  chargingCost?: number; // PHP
}

/**
 * Detailed information about a charging stop
 */
export interface ChargingStop {
  segmentId: string;
  station: Station;
  arrivalBattery: number; // % when arriving
  departureBattery: number; // % when leaving
  chargingDuration: number; // minutes
  energyCharged: number; // kWh
  cost: number; // PHP
  distanceFromStart: number; // km
  reasonForStop: string; // e.g., "Low battery", "Optimal stop point"
}

/**
 * Cost breakdown for the trip
 */
export interface CostBreakdown {
  chargingCost: number; // Total cost of electricity
  bookingFee: number; // 2% of charging cost
  serviceFee: number; // Flat service fee
  totalCost: number; // Sum of all costs
}

/**
 * Complete detailed route with all segments and metadata
 */
export interface DetailedRoute {
  id: string;
  from: string; // Origin address
  to: string; // Destination address

  // Route segments (start → travel → charging → travel → destination)
  segments: RouteSegment[];

  // Charging stops summary
  chargingStops: ChargingStop[];

  // Polyline coordinates for map rendering
  polyline: Array<{ latitude: number; longitude: number }>;

  // Trip summary
  totalDistance: number; // km
  totalTravelTime: number; // minutes (driving only)
  totalChargingTime: number; // minutes (charging only)
  totalDuration: number; // minutes (travel + charging)

  // Cost information
  costBreakdown: CostBreakdown;

  // Battery information
  initialBattery: number; // % at start
  finalBattery: number; // % at destination
  totalEnergyUsed: number; // kWh consumed
  totalEnergyCharged: number; // kWh charged at stations

  // Timestamps
  createdAt: Date;
}

/**
 * Route calculation options
 */
export interface RouteCalculationOptions {
  from: string;
  to: string;
  currentBatteryPercent?: number; // Default: 80%
  preferFastChargers?: boolean; // Default: true
  maxDetourKm?: number; // Max detour for charging stations (default: 5km)
  minimumArrivalBattery?: number; // Min battery % at destination (default: 15%)
  chargingStrategy?: number; // 0 = Few long, 1 = Balanced, 2 = Many short (default: 1)
  trafficMultiplier?: number; // Traffic impact on consumption (default: 1.0)
}

/**
 * Result from route calculation
 */
export interface RouteCalculationResult {
  success: boolean;
  route?: DetailedRoute;
  error?: string;
  warnings?: string[];
}
