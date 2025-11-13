import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList, EnrichedStation } from '@/types/navigation'; 
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { OPENCHARGEMAP_API_KEY } from '@env';

type Props = NativeStackScreenProps<MapStackParamList, 'MapHome'>;

type ChargingMarker = {
  id: number;
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
};

/**
 * MapHomeScreen is the main map interface showing the user's location
 * and available charging stations. Provides two main actions:
 * - Find Nearby Stations
 * - Plan a Trip
 */
export default function MapHomeScreen({ navigation }: Props) {

  const [region] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });


  const [markers, setMarkers] = useState<ChargingMarker[]>([]);
  const [rawPOIs, setRawPOIs] = useState<any[]>([]); // store full API data for enrichment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    mapPlaceholder: {
      flex: 1,
      backgroundColor: '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mapText: {
      fontSize: 24,
      color: '#4CAF50',
      fontWeight: 'bold',
    },
    mapSubtext: {
      fontSize: 14,
      color: '#666',
      marginTop: 10,
    },
    buttonContainer: {
      padding: 20,
      gap: 15,
    },
    button: {
      backgroundColor: '#4CAF50',
      paddingVertical: 15,
      borderRadius: 8,
    },
    secondaryButton: {
      backgroundColor: '#2196F3',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  useEffect(() => {
    async function loadPOIs() {
      setLoading(true);
      setError(null);
      try {
  // Specify bounding box with top-left and bottom-right corners as (lat,lng),(lat2,lng2)
  // Top-left (lat, lng) = approximate NW corner of Philippines
  const topLeftLat = 21.0;
  const topLeftLng = 116.9;
  // Bottom-right (lat2, lng2) = approximate SE corner of Philippines
  const bottomRightLat = 4.5;
  const bottomRightLng = 127.8;

  // OpenChargeMap expects boundingbox as [minLat, minLng, maxLat, maxLng]
  const minLat = Math.min(topLeftLat, bottomRightLat);
  const maxLat = Math.max(topLeftLat, bottomRightLat);
  const minLng = Math.min(topLeftLng, bottomRightLng);
  const maxLng = Math.max(topLeftLng, bottomRightLng);

  // Use comma-separated values (no brackets) to avoid encoding issues
  const url = `https://api.openchargemap.io/v3/poi?key=${OPENCHARGEMAP_API_KEY}&boundingbox=(${minLat},${minLng}),(${maxLat},${maxLng})&maxresults=500`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`OpenChargeMap request failed: ${resp.status}`);
        const data = await resp.json();

        // Data already contains details for each POI. Map to our Marker shape.
        setRawPOIs(data);

        const mapped: ChargingMarker[] = (data || [])
          .map((item: any) => {
            const a = item?.AddressInfo;
            if (!a || a?.Latitude == null || a?.Longitude == null) return null;
            return {
              id: item.ID ?? item.id ?? Math.random(),
              latitude: Number(a.Latitude),
              longitude: Number(a.Longitude),
              title: a.Title || a.AddressLine1 || 'Charging Site',
              address: a.AddressLine1 || a.Town || a.StateOrProvince || '',
            } as ChargingMarker;
          })
          .filter(Boolean) as ChargingMarker[];

        setMarkers(mapped);
      } catch (err: any) {
        console.error('Failed to load OpenChargeMap POIs', err);
        setError(err.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }

    loadPOIs();
  }, []);

  return (
    <View style={styles.container} >
      <View style={styles.mapPlaceholder}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Center marker */}
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="Central Manila"
            description="Metro Manila, Philippines"
          />

          {/* Charging station markers */}
          {markers.map((m) => (
            <Marker
              key={`ocm-${m.id}`}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.title}
              description={m.address}
            />
          ))}
        </MapView>

        {loading && (
          <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6 }}>
            <Text>Loading stations...</Text>
          </View>
        )}

        {error && (
          <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,200,200,0.95)', padding: 8, borderRadius: 6 }}>
            <Text style={{ color: '#900' }}>Error: {error}</Text>
          </View>
        )}

      </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // Enrich raw POIs into stations and take 10 nearest to user fixed location
                const userLat = 14.590705512011606;
                const userLng = 121.06621291296217;

                const enriched: EnrichedStation[] = rawPOIs
                  .map(poi => {
                    const a = poi?.AddressInfo;
                    if (!a) return null;
                    const lat = a.Latitude;
                    const lng = a.Longitude;
                    if (lat == null || lng == null) return null;
                    const connections = poi?.Connections || [];
                    const totalPlugs = connections.length || 1; // fallback at least 1
                    const plugsInUse = Math.floor(Math.random() * totalPlugs);
                    const availablePlugs = Math.max(totalPlugs - plugsInUse, 0);
                    const plugTypes = connections.map((c: any) => c.ConnectionType?.Title).filter(Boolean);
                    const powerKW = connections.reduce((sum: number, c: any) => sum + (c.PowerKW || 0), 0) || 0;
                    // Haversine distance
                    const R = 6371; // km
                    const dLat = (lat - userLat) * Math.PI / 180;
                    const dLng = (lng - userLng) * Math.PI / 180;
                    const aHarv = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(userLat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
                    const cHarv = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1-aHarv));
                    const distanceKm = R * cHarv;
                    const avgSpeedKmh = 30; // heuristic urban speed
                    const driveMinutes = (distanceKm / avgSpeedKmh) * 60;
                    const rating = +( (Math.random() * 1.5) + 3.5 ).toFixed(1); // 3.5 - 5.0
                    const pricePerKWh = +( (Math.random() * 10) + 15 ).toFixed(2); // synthetic PHP price
                    const amenities = {
                      wifi: Math.random() > 0.5,
                      bathroom: Math.random() > 0.4,
                      pwdFriendly: Math.random() > 0.6,
                      waitingLounge: Math.random() > 0.3,
                    };
                    return {
                      id: String(poi.ID || poi.id || Math.random()),
                      title: a.Title || a.AddressLine1 || 'Charging Site',
                      address: [a.AddressLine1, a.Town, a.StateOrProvince].filter(Boolean).join(', '),
                      latitude: lat,
                      longitude: lng,
                      totalPlugs,
                      plugsInUse,
                      availablePlugs,
                      plugTypes,
                      powerKW,
                      distanceKm,
                      driveMinutes,
                      rating,
                      pricePerKWh,
                      amenities,
                      state: a.StateOrProvince || '',
                    } as EnrichedStation;
                  })
                  .filter(Boolean) as EnrichedStation[];

                const nearest10 = enriched
                  .sort((a,b) => a.distanceKm - b.distanceKm)
                  .slice(0,10);

                navigation.navigate('NearbyStations', { stations: nearest10 });
              }}
            >
              <Text style={styles.buttonText}>Find Nearby Stations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('PlanTrip')}
            >
              <Text style={styles.buttonText}>Plan a Trip</Text>
            </TouchableOpacity>
          </View>
    </View>
  );
}
