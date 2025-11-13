/**
 * OpenChargeMap API Integration
 * Provides real EV charging station data worldwide
 * Free tier: 100 requests/day per IP (no key needed, but key increases limit)
 * Docs: https://openchargemap.org/site/develop/api
 */

import { OPENCHARGEMAP_API_KEY } from '@env';

const API_KEY = OPENCHARGEMAP_API_KEY || '';
const BASE_URL = 'https://api.openchargemap.io/v3/poi';

export interface ChargingStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  distance?: number; // Distance from search point in km
  operatorName?: string;
  numberOfPoints: number;
  statusType?: string; // 'Operational', 'Planned', etc.
  powerKW?: number; // Max charging power
  connectorTypes: string[]; // ['CCS', 'CHAdeMO', 'Type 2', etc.]
  isAvailable: boolean;
  isFastCharger: boolean; // >= 50kW
}

/**
 * Search for charging stations near a point
 * @param latitude Center point latitude
 * @param longitude Center point longitude
 * @param radiusKM Search radius in kilometers (max 100)
 * @param maxResults Maximum number of results (default 20)
 */
export async function searchStationsNearPoint(
  latitude: number,
  longitude: number,
  radiusKM: number = 50,
  maxResults: number = 20
): Promise<ChargingStation[]> {
  try {
    const params = new URLSearchParams({
      output: 'json',
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      distance: radiusKM.toString(),
      distanceunit: 'KM',
      maxresults: maxResults.toString(),
      compact: 'true',
      verbose: 'false',
      key: API_KEY,
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`OpenChargeMap error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return parseStations(data);
  } catch (error) {
    console.error('Error fetching charging stations:', error);
    throw error;
  }
}

/**
 * Search for charging stations along a route corridor
 * Creates multiple search points along the route to find stations
 * @param routeCoordinates Array of coordinates representing the route
 * @param corridorWidthKM How far from route to search (default 10km)
 */
export async function searchStationsAlongRoute(
  routeCoordinates: Array<{ latitude: number; longitude: number }>,
  corridorWidthKM: number = 10
): Promise<ChargingStation[]> {
  try {
    // Sample points along route (every ~50km or so)
    const samplePoints = sampleRoutePoints(routeCoordinates, 5);

    // Search near each sample point
    const stationPromises = samplePoints.map(point =>
      searchStationsNearPoint(point.latitude, point.longitude, corridorWidthKM, 10)
    );

    const stationArrays = await Promise.all(stationPromises);

    // Flatten and deduplicate by station ID
    const allStations = stationArrays.flat();
    const uniqueStations = deduplicateStations(allStations);

    // Sort by operational status and power
    return uniqueStations.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      if (a.isFastCharger !== b.isFastCharger) return a.isFastCharger ? -1 : 1;
      return (b.powerKW || 0) - (a.powerKW || 0);
    });
  } catch (error) {
    console.error('Error searching stations along route:', error);
    throw error;
  }
}

/**
 * Parse OpenChargeMap API response into our ChargingStation format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseStations(data: any[]): ChargingStation[] {
  return data.map(poi => {
    const addressInfo = poi.AddressInfo || {};
    const connections = poi.Connections || [];
    const statusType = poi.StatusType?.Title || 'Unknown';
    const operator = poi.OperatorInfo?.Title || 'Unknown Operator';

    // Get max power and connector types
    let maxPowerKW = 0;
    const connectorTypes: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connections.forEach((conn: any) => {
      if (conn.PowerKW && conn.PowerKW > maxPowerKW) {
        maxPowerKW = conn.PowerKW;
      }
      if (conn.ConnectionType?.Title) {
        const type = conn.ConnectionType.Title;
        if (!connectorTypes.includes(type)) {
          connectorTypes.push(type);
        }
      }
    });

    const isAvailable = statusType.toLowerCase().includes('operational');
    const isFastCharger = maxPowerKW >= 50;

    return {
      id: poi.ID,
      name: addressInfo.Title || `Charging Station ${poi.ID}`,
      latitude: addressInfo.Latitude,
      longitude: addressInfo.Longitude,
      address: formatAddress(addressInfo),
      distance: addressInfo.Distance,
      operatorName: operator,
      numberOfPoints: poi.NumberOfPoints || connections.length,
      statusType,
      powerKW: maxPowerKW > 0 ? maxPowerKW : undefined,
      connectorTypes,
      isAvailable,
      isFastCharger,
    };
  });
}

/**
 * Format address from OpenChargeMap address info
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatAddress(addressInfo: any): string {
  const parts = [
    addressInfo.AddressLine1,
    addressInfo.Town,
    addressInfo.StateOrProvince,
    addressInfo.Postcode,
  ].filter(Boolean);

  return parts.join(', ') || 'Address not available';
}

/**
 * Sample points along a route
 * @param coordinates Full route coordinates
 * @param numSamples Number of sample points to take
 */
function sampleRoutePoints(
  coordinates: Array<{ latitude: number; longitude: number }>,
  numSamples: number
): Array<{ latitude: number; longitude: number }> {
  if (coordinates.length <= numSamples) {
    return coordinates;
  }

  const samples: Array<{ latitude: number; longitude: number }> = [];
  const step = Math.floor(coordinates.length / numSamples);

  for (let i = 0; i < coordinates.length; i += step) {
    samples.push(coordinates[i]);
  }

  // Always include the last point
  if (samples[samples.length - 1] !== coordinates[coordinates.length - 1]) {
    samples.push(coordinates[coordinates.length - 1]);
  }

  return samples;
}

/**
 * Remove duplicate stations based on ID
 */
function deduplicateStations(stations: ChargingStation[]): ChargingStation[] {
  const seen = new Set<number>();
  return stations.filter(station => {
    if (seen.has(station.id)) {
      return false;
    }
    seen.add(station.id);
    return true;
  });
}

/**
 * Filter stations by criteria
 */
export function filterStations(
  stations: ChargingStation[],
  options: {
    onlyAvailable?: boolean;
    onlyFastChargers?: boolean;
    minPowerKW?: number;
    connectorTypes?: string[];
  }
): ChargingStation[] {
  return stations.filter(station => {
    if (options.onlyAvailable && !station.isAvailable) return false;
    if (options.onlyFastChargers && !station.isFastCharger) return false;
    if (options.minPowerKW && (!station.powerKW || station.powerKW < options.minPowerKW))
      return false;
    if (options.connectorTypes && options.connectorTypes.length > 0) {
      const hasRequiredConnector = options.connectorTypes.some(type =>
        station.connectorTypes.some(ct => ct.includes(type))
      );
      if (!hasRequiredConnector) return false;
    }
    return true;
  });
}
