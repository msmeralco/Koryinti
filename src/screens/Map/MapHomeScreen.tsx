import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OPENCHARGEMAP_API_KEY } from '@env';
import mapDarkStyle from './mapDarkStyle.json';

type Props = NativeStackScreenProps<MapStackParamList, 'MapHome'>;

type ChargingMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
};

const EVCarIcon = require('../../../assets/evcaricon.png');

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
  const styles = StyleSheet.create({
  // FULL-SCREEN DARK BACKGROUND
  screen: {
    flex: 1,
    backgroundColor: '#050A10', // fill whole screen
  },

  // TOP “MAP” AREA
  mapArea: {
    flex: 1.3,
    backgroundColor: '#050A10',
  },

  // BOTTOM CONTENT AREA
  bottomContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
  },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#C6CFD7',
    fontSize: 15,
    marginBottom: 2,
  },
  batteryPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#261013',
  },
  batteryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5252',
  },

  carImage: {
    width: 190,
    height: 100,
  },

  buttonContainer: {
    marginTop: 4,
    gap: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#46F98C',
    paddingVertical: 16,
    borderRadius: 20,
  },
  primaryButtonText: {
    color: '#02110A',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171C24',
    paddingVertical: 16,
    borderRadius: 20,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  }});

  return (
    <View style={styles.screen}>
      {/* Top “map” area (just dark for now) */}
      <View style={styles.mapArea}>
         <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          provider={PROVIDER_GOOGLE}
          googleMapId="508c49184e5a4073b3a02f38"
          showsUserLocation
          showsMyLocationButton
        >
          {markers.map((m) => (
            <Marker
              key={`ocm-${m.id}`}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.title}
              description={m.address}
              pinColor="wheat"
            />
          ))}
        </MapView>
      </View>
      

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        {/* Greeting + info + car */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingText}>Welcome back!</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>9:30 A.M.</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>28°C</Text>
              <Ionicons
                name="sunny-outline"
                size={16}
                color="#C6CFD7"
                style={{ marginLeft: 6 }}
              />
            </View>

            <View style={styles.batteryPill}>
              <Ionicons name="flash" size={16} color="#FF5252" />
              <Text style={styles.batteryText}>24%</Text>
            </View>
          </View>

          <Image source={EVCarIcon} style={styles.carImage} resizeMode="contain" />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
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
                  const aHarv = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(userLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
                  const cHarv = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
                  const distanceKm = R * cHarv;
                  const avgSpeedKmh = 30; // heuristic urban speed
                  const driveMinutes = (distanceKm / avgSpeedKmh) * 60;
                  const rating = +((Math.random() * 1.5) + 3.5).toFixed(1); // 3.5 - 5.0
                  const pricePerKWh = +((Math.random() * 10) + 15).toFixed(2); // synthetic PHP price
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
                .sort((a, b) => a.distanceKm - b.distanceKm)
                .slice(0, 10);

              navigation.navigate('NearbyStations', { stations: nearest10 });
            }}
          >
            <MaterialCommunityIcons
              name="flash-outline"
              size={22}
              color="#02110A"
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Find Nearby Stations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={() => navigation.navigate('PlanTrip')}
          >
            <Text style={styles.secondaryButtonText}>Plan a Trip</Text>
          </TouchableOpacity>
        </View>
    </View>
    </View>
  );
}

