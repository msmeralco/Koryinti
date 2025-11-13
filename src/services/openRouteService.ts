/**
 * OpenRouteService API Integration
 * Provides real route calculation with distance, duration, and geometry
 * Free tier: 5000 requests/day
 * Docs: https://openrouteservice.org/dev/#/api-docs
 */

const API_KEY = process.env.OPENROUTE_SERVICE_API_KEY || '';
const BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry: RouteCoordinate[]; // Polyline coordinates for map
  bbox: number[]; // Bounding box [minLng, minLat, maxLng, maxLat]
}

/**
 * Calculate route between two points using OpenRouteService
 * @param start Starting coordinates {latitude, longitude}
 * @param end Ending coordinates {latitude, longitude}
 * @returns Route with distance, duration, and geometry
 */
export async function calculateRoute(
  start: RouteCoordinate,
  end: RouteCoordinate
): Promise<RouteResult> {
  try {
    // OpenRouteService uses [longitude, latitude] order (GeoJSON format)
    const requestBody = {
      coordinates: [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ],
      units: 'km',
      language: 'en',
      geometry: true,
      instructions: false, // We don't need turn-by-turn for now
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouteService error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const route = data.routes[0];
    const summary = route.summary;

    // Decode geometry (it's encoded by default)
    const geometry = decodePolyline(route.geometry);

    return {
      distance: summary.distance, // Already in km
      duration: summary.duration / 60, // Convert seconds to minutes
      geometry,
      bbox: route.bbox,
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
}

/**
 * Decode OpenRouteService polyline format
 * Returns array of {latitude, longitude} coordinates
 */
function decodePolyline(encoded: string): RouteCoordinate[] {
  const coordinates: RouteCoordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

/**
 * Get route distance between two points (simplified - just distance)
 * Useful for quick checks without full route details
 */
export async function getRouteDistance(
  start: RouteCoordinate,
  end: RouteCoordinate
): Promise<number> {
  const route = await calculateRoute(start, end);
  return route.distance;
}
