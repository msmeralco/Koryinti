import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OPENCHARGEMAP_API_KEY } from '@env';
import mapDarkStyle from './mapDarkStyle.json';

type Props = NativeStackScreenProps<MapStackParamList, 'MapHome'>;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EVCarIcon = require('../../../assets/evcaricon.png');

export default function MapHomeScreen({ navigation }: Props) {
  // Raw POIs & enriched stations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawPOIs, setRawPOIs] = useState<any[]>([]);
  const [enrichedStations, setEnrichedStations] = useState<EnrichedStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<EnrichedStation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [region] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });
  const userLocation = { latitude: 14.59144955737441, longitude: 121.06729986080205 };

  // Pulsing user marker animation
  const pulseScale = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = () => {
      pulseScale.setValue(0);
      pulseOpacity.setValue(0.8);
      Animated.parallel([
        Animated.timing(pulseScale, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]).start(loop);
    };
    loop();
  }, [pulseScale, pulseOpacity]);

  // Load & enrich POIs
  useEffect(() => {
    async function loadPOIs() {
      setLoading(true);
      setError(null);
      try {
        const topLeftLat = 21.0;
        const topLeftLng = 116.9;
        const bottomRightLat = 4.5;
        const bottomRightLng = 127.8;
        const minLat = Math.min(topLeftLat, bottomRightLat);
        const maxLat = Math.max(topLeftLat, bottomRightLat);
        const minLng = Math.min(topLeftLng, bottomRightLng);
        const maxLng = Math.max(topLeftLng, bottomRightLng);
        const url = `https://api.openchargemap.io/v3/poi?key=${OPENCHARGEMAP_API_KEY}&boundingbox=(${minLat},${minLng}),(${maxLat},${maxLng})&maxresults=500`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`OpenChargeMap request failed: ${resp.status}`);
        const data = await resp.json();
        setRawPOIs(data);

        // Enrich stations once
        const userLat = userLocation.latitude;
        const userLng = userLocation.longitude;
        const enriched: EnrichedStation[] = (data || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((poi: any) => {
            const a = poi?.AddressInfo;
            if (!a) return null;
            const lat = a.Latitude;
            const lng = a.Longitude;
            if (lat == null || lng == null) return null;
            const connections = poi?.Connections || [];
            const totalPlugs = connections.length || 1;
            const plugsInUse = Math.floor(Math.random() * totalPlugs);
            const availablePlugs = Math.max(totalPlugs - plugsInUse, 0);
            const plugTypes = connections
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((c: any) => c.ConnectionType?.Title)
              .filter(Boolean);
            const powerKW =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              connections.reduce((sum: number, c: any) => sum + (c.PowerKW || 0), 0) || 0;
            // Haversine distance
            const R = 6371; // km
            const dLat = ((lat - userLat) * Math.PI) / 180;
            const dLng = ((lng - userLng) * Math.PI) / 180;
            const aHarv =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((userLat * Math.PI) / 180) *
                Math.cos((lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const cHarv = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
            const distanceKm = R * cHarv;
            const avgSpeedKmh = 30;
            const driveMinutes = (distanceKm / avgSpeedKmh) * 60;
            const rating = +(Math.random() * 1.5 + 3.5).toFixed(1);
            const pricePerKWh = +(Math.random() * 10 + 15).toFixed(2);
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
        setEnrichedStations(enriched);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadPOIs();
  }, []);

  // All stations (search moved to NearbyStations screen)
  const allStations = enrichedStations;
  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#050A10' },
    mapArea: { flex: 1.3, backgroundColor: '#050A10' },
    bottomContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 },
    greetingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 18,
    },
    greetingText: { fontSize: 30, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { color: '#C6CFD7', fontSize: 15, marginBottom: 2 },
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
    batteryText: { marginLeft: 6, fontSize: 14, fontWeight: '700', color: '#FF5252' },
    carImage: { width: 190, height: 100 },
    buttonContainer: { marginTop: 4, gap: 12 },
    buttonIcon: { marginRight: 10 },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#46F98C',
      paddingVertical: 16,
      borderRadius: 20,
    },
    primaryButtonText: { color: '#02110A', fontSize: 18, fontWeight: '700' },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#171C24',
      paddingVertical: 16,
      borderRadius: 20,
    },
    secondaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
    userMarkerWrapper: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    userMarkerCore: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#00E0A8',
      borderWidth: 2,
      borderColor: '#ffffff',
      shadowColor: '#00E0A8',
      shadowOpacity: 0.7,
      shadowRadius: 4,
      elevation: 6,
    },
    userMarkerPulse: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#00E0A8' },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      backgroundColor: '#07111a',
      borderRadius: 20,
      padding: 22,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
    modalAddress: { fontSize: 14, color: '#C6CFD7', marginBottom: 10 },
    modalInfo: { fontSize: 14, color: '#C6CFD7', marginBottom: 6 },
    modalButtons: { flexDirection: 'row', marginTop: 12, gap: 12 },
    viewProfileBtn: {
      flex: 1,
      backgroundColor: '#46F98C',
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewProfileText: { color: '#02110A', fontSize: 16, fontWeight: '700' },
    closeBtn: {
      flex: 1,
      backgroundColor: '#171C24',
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* MAP */}
      <View style={styles.mapArea}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          provider={PROVIDER_GOOGLE}
          googleMapId="508c49184e5a4073b3a02f38"
          customMapStyle={mapDarkStyle as any}
          showsUserLocation
          showsMyLocationButton
        >
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            zIndex={999}
          >
            <View style={styles.userMarkerWrapper}>
              <Animated.View
                style={[
                  styles.userMarkerPulse,
                  {
                    opacity: pulseOpacity,
                    transform: [
                      {
                        scale: pulseScale.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.4, 3.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.userMarkerCore} />
            </View>
          </Marker>
          {allStations.map(s => (
            <Marker
              key={`station-${s.id}`}
              coordinate={{ latitude: s.latitude, longitude: s.longitude }}
              title={s.title}
              description={s.address}
              pinColor="wheat"
              onPress={() => {
                setSelectedStation(s);
                setShowModal(true);
              }}
            />
          ))}
        </MapView>
      </View>

      {/* BOTTOM CONTENT */}
      <View style={styles.bottomContent}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingText}>Welcome back!</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>28°C</Text>
              <Ionicons name="sunny-outline" size={16} color="#C6CFD7" style={{ marginLeft: 6 }} />
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
              const nearest = [...enrichedStations].sort((a, b) => a.distanceKm - b.distanceKm);
              navigation.navigate('NearbyStations', { stations: nearest });
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
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('PlanTrip')}
          >
            <Text style={styles.secondaryButtonText}>Plan a Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Station Detail Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedStation ? (
              <>
                <Text style={styles.modalTitle}>{selectedStation.title}</Text>
                <Text style={styles.modalAddress}>{selectedStation.address}</Text>
                <Text style={styles.modalInfo}>
                  ⭐ {selectedStation.rating.toFixed(1)} • {selectedStation.availablePlugs} /{' '}
                  {selectedStation.totalPlugs} free
                </Text>
                <Text style={styles.modalInfo}>
                  Distance {selectedStation.distanceKm.toFixed(1)} km •{' '}
                  {selectedStation.driveMinutes.toFixed(0)} min
                </Text>
                <Text style={styles.modalInfo}>
                  ₱{selectedStation.pricePerKWh.toFixed(2)}/kWh • Power{' '}
                  {selectedStation.powerKW.toFixed(0)} kW
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.viewProfileBtn}
                    onPress={() => {
                      setShowModal(false);
                      navigation.navigate('StationProfile', { station: selectedStation });
                    }}
                  >
                    <Text style={styles.viewProfileText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.modalInfo}>No station selected.</Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}