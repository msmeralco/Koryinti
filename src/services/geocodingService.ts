/**
 * Geocoding service using Nominatim (OpenStreetMap)
 * Free and open-source, no API key required
 */

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Search for places using Nominatim geocoding API
 * Biased towards Philippines results
 */
export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Nominatim API endpoint
    // countrycodes=ph biases results to Philippines
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&countrycodes=ph` + // Prioritize Philippines
      `&limit=5` +
      `&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Revolt-EV-App', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const results: GeocodingResult[] = await response.json();
    return results;
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

/**
 * Reverse geocoding: Convert coordinates to address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${latitude}` +
      `&lon=${longitude}` +
      `&format=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Revolt-EV-App',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const result: GeocodingResult = await response.json();
    return result.display_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Format display name to be shorter and more readable
 */
export function formatDisplayName(displayName: string): string {
  // Remove country if it's Philippines
  const cleaned = displayName.replace(', Philippines', '');

  // Take first 3 parts (usually enough context)
  const parts = cleaned.split(', ');
  return parts.slice(0, 3).join(', ');
}
