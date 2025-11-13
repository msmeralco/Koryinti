import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';
import { calculateDetailedRoute } from '@/services/routeCalculationEngine';
import { DetailedRoute, RouteSegment } from '@/types/route-calculation';
import mapDarkStyle from './mapDarkStyle.json';

type Props = NativeStackScreenProps<MapStackParamList, 'TripRoute'>;

const ACCENT_GREEN = '#00F470';
const MAX_LOCATION_LABEL_LENGTH = 48;

export default function TripRouteScreen({ navigation, route }: Props) {
  const { from, to, currentBatteryPercent = 80, minimumArrivalBattery = 25 } = route.params;

  const [detailedRoute, setDetailedRoute] = useState<DetailedRoute | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  const truncateLocation = (value: string) => {
    if (!value) return '';
    if (value.length <= MAX_LOCATION_LABEL_LENGTH) return value;
    return value.slice(0, MAX_LOCATION_LABEL_LENGTH - 1) + '…';
  };

  const fromLabel = truncateLocation(from);
  const toLabel = truncateLocation(to);

  // Compute an initial region once route is available
  const region = useMemo(() => {
    if (!detailedRoute || detailedRoute.segments.length < 2) {
      return {
        latitude: 14.5995,
        longitude: 120.9842,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }
    const first = detailedRoute.segments[0].coordinates;
    const last = detailedRoute.segments[detailedRoute.segments.length - 1].coordinates;
    const midLat = (first.latitude + last.latitude) / 2;
    const midLon = (first.longitude + last.longitude) / 2;
    const latDelta = Math.max(Math.abs(first.latitude - last.latitude) * 1.5, 0.3);
    const lonDelta = Math.max(Math.abs(first.longitude - last.longitude) * 1.5, 0.3);
    return {
      latitude: midLat,
      longitude: midLon,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
  }, [detailedRoute]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await calculateDetailedRoute({
          from,
          to,
          currentBatteryPercent,
          preferFastChargers: true,
          maxDetourKm: 5,
          minimumArrivalBattery,
        });
        if (mounted) {
          if (result.success && result.route) {
            setDetailedRoute(result.route);
            console.warn('✅ Route calculated successfully:', {
              chargingStops: result.route.chargingStops.length,
              segments: result.route.segments.length,
              distance: result.route.totalDistance,
            });
            if (result.route.chargingStops.length > 0) {
              console.warn('🔋 Charging stops:', result.route.chargingStops);
            }
          } else {
            setError(result.error || 'Failed to calculate route');
          }
        }
      } catch {
        if (mounted) {
          setError('An unexpected error occurred while calculating the route');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [from, to, currentBatteryPercent, minimumArrivalBattery]);

  const handleReserveChargers = () => {
    if (!detailedRoute || detailedRoute.chargingStops.length === 0) return;
    const enrichedStations: EnrichedStation[] = detailedRoute.chargingStops.map(stop => ({
      id: stop.station.id,
      title: stop.station.name,
      address: stop.station.address,
      latitude: stop.station.latitude,
      longitude: stop.station.longitude,
      totalPlugs: stop.station.totalChargers,
      plugsInUse: stop.station.totalChargers - stop.station.availableChargers,
      availablePlugs: stop.station.availableChargers,
      plugTypes: stop.station.amenities,
      powerKW: stop.station.powerKW || 50,
      distanceKm: stop.distanceFromStart,
      driveMinutes: 0,
      rating: stop.station.rating,
      pricePerKWh: stop.station.pricePerKwh,
      amenities: {
        wifi: stop.station.amenities.includes('WiFi'),
        bathroom:
          stop.station.amenities.includes('Restroom') ||
          stop.station.amenities.includes('Bathroom'),
        pwdFriendly: false,
        waitingLounge: false,
      },
      state: '',
    }));
    navigation.navigate('ReservationDetails', {
      routeId: detailedRoute.id,
      stations: enrichedStations,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={ACCENT_GREEN} />
        <Text style={styles.loadingText}>Calculating optimal route...</Text>
        <Text style={styles.loadingSubtext}>Analyzing battery needs and finding chargers</Text>
      </View>
    );
  }

  if (error || !detailedRoute) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>❌ {error || 'Unable to calculate route'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color="#050816"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.retryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <MapView
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        googleMapId="508c49184e5a4073b3a02f38"
        customMapStyle={mapDarkStyle as any}
        showsUserLocation
      >
        {/* Route polyline */}
        <Polyline coordinates={detailedRoute.polyline} strokeColor={ACCENT_GREEN} strokeWidth={4} />

        {/* Charging station markers */}
        {detailedRoute.chargingStops.map((stop, index) => {
          console.warn(`⚡ Rendering charging marker ${index + 1}:`, {
            name: stop.station.name,
            lat: stop.station.latitude,
            lon: stop.station.longitude,
          });
          return (
            <Marker
              key={`charging-${index}`}
              coordinate={{ latitude: stop.station.latitude, longitude: stop.station.longitude }}
              title={stop.station.name}
              description={`Stop ${index + 1} • ${stop.chargingDuration} min charge`}
              pinColor={ACCENT_GREEN}
            />
          );
        })}

        {/* Start marker */}
        <Marker
          coordinate={detailedRoute.segments[0].coordinates}
          title="Start"
          description={from}
          pinColor="#3B82F6"
        />

        {/* Destination marker */}
        <Marker
          coordinate={detailedRoute.segments[detailedRoute.segments.length - 1].coordinates}
          title="Destination"
          description={to}
          pinColor="#F97373"
        />
      </MapView>

  <View style={[styles.bottomSheet, isDetailsCollapsed && styles.bottomSheetCollapsed]}>
        {/* Toggle button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
        >
          <Text style={styles.toggleButtonText}>
            {isDetailsCollapsed ? '▲ Show Route Details' : '▼ Hide to View Map'}
          </Text>
        </TouchableOpacity>

        <View style={styles.handle} />

        {!isDetailsCollapsed && (
          <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.headerRow}>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.title}>Suggested route</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {fromLabel}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    → {toLabel}
                  </Text>
                </View>
                <View style={styles.titleIconWrapper}>
                  <Ionicons name="map-outline" size={22} color={ACCENT_GREEN} />
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Ionicons name="speedometer-outline" size={18} color={ACCENT_GREEN} />
                  <Text style={styles.statValue}>{detailedRoute.totalDistance} km</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={18} color={ACCENT_GREEN} />
                  <Text style={styles.statValue}>
                    {Math.floor(detailedRoute.totalDuration / 60)}h{' '}
                    {detailedRoute.totalDuration % 60}m
                  </Text>
                  <Text style={styles.statLabel}>Total time</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="battery-charging-80"
                    size={18}
                    color={ACCENT_GREEN}
                  />
                  <Text style={styles.statValue}>{detailedRoute.chargingStops.length}</Text>
                  <Text style={styles.statLabel}>Charging stops</Text>
                </View>
              </View>

              {/* Route Details */}
              <Text style={styles.sectionTitle}>Route details</Text>
              {detailedRoute.segments.map(segment => (
                <RouteSegmentCard key={segment.id} segment={segment} />
              ))}

              {/* Cost Summary */}
              {detailedRoute.chargingStops.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>Cost summary</Text>
                  <View style={styles.costSummary}>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Total distance</Text>
                      <Text style={styles.costValue}>{detailedRoute.totalDistance} km</Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Total travel time</Text>
                      <Text style={styles.costValue}>
                        {Math.floor(detailedRoute.totalTravelTime / 60)}h{' '}
                        {detailedRoute.totalTravelTime % 60}m
                      </Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Charging time</Text>
                      <Text style={styles.costValue}>{detailedRoute.totalChargingTime} min</Text>
                    </View>
                    <View style={styles.dividerThin} />
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Charging cost</Text>
                      <Text style={styles.costValue}>
                        ₱{detailedRoute.costBreakdown.chargingCost.toFixed(2)}
                      </Text>
                      <Text style={styles.statLabel}>Total Time</Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Booking fee (2%)</Text>
                      <Text style={styles.costValue}>
                        ₱{detailedRoute.costBreakdown.bookingFee.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.dividerThin} />
                    <View style={styles.costRow}>
                      <Text style={styles.costLabelBold}>Total cost</Text>
                      <Text style={styles.costValueBold}>
                        ₱{detailedRoute.costBreakdown.totalCost.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.reserveButton} onPress={handleReserveChargers}>
                    <Ionicons
                      name="flash-outline"
                      size={18}
                      color="#050816"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.reserveButtonText}>Reserve chargers</Text>
                  </TouchableOpacity>
                </>
              )}

              {detailedRoute.chargingStops.length === 0 && (
                <View style={styles.noChargingNeeded}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color={ACCENT_GREEN}
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.noChargingText}>No charging needed</Text>
                  <Text style={styles.noChargingSubtext}>
                    Your current battery is sufficient for this trip.
                  </Text>
                </View>
              )}

              <View style={styles.bottomPadding} />
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function RouteSegmentCard({ segment }: { segment: RouteSegment }) {
  if (segment.type === 'start') {
    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentIconStart}>
            <Ionicons name="play-outline" size={18} color="#050816" />
          </View>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentTitle}>{segment.location}</Text>
            <Text style={styles.segmentSubtitle}>Starting point</Text>
          </View>
          <Text style={styles.batteryText}>{segment.batteryAtArrival.toFixed(0)}%</Text>
        </View>
      </View>
    );
  }

  if (segment.type === 'travel') {
    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentIconTravel}>
            <Ionicons name="arrow-forward-outline" size={18} color="#050816" />
          </View>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentTitle}>Travel to next point</Text>
            <Text style={styles.segmentSubtitle}>
              {segment.distanceFromPrevious.toFixed(1)} km •{' '}
              {Math.floor(segment.durationFromPrevious / 60)}h{' '}
              {Math.round(segment.durationFromPrevious % 60)}m
            </Text>
          </View>
          <Text style={styles.batteryText}>{segment.batteryAtArrival.toFixed(0)}%</Text>
        </View>

        {segment.instructions && segment.instructions.length > 0 && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Route instructions</Text>
            {segment.instructions.slice(0, 3).map((instruction, idx) => (
              <Text key={idx} style={styles.instructionText}>
                • {instruction.instruction}
              </Text>
            ))}
            {segment.instructions.length > 3 && (
              <Text style={styles.instructionText}>
                … and {segment.instructions.length - 3} more steps
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }

  if (segment.type === 'charging_station') {
    return (
      <View style={styles.segmentCardCharging}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentIconCharging}>
            <Ionicons name="battery-charging-outline" size={18} color="#050816" />
          </View>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentTitleCharging}>{segment.location}</Text>
            <Text style={styles.segmentSubtitle}>
              Charge for {segment.chargingDuration} minutes
            </Text>
            <Text style={styles.chargingCost}>
              Cost: ₱{segment.chargingCost?.toFixed(2)}{' '}
              {segment.energyCharged ? `(${segment.energyCharged.toFixed(1)} kWh)` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.batteryChange}>
          <Text style={styles.batteryText}>{segment.batteryAtArrival.toFixed(0)}%</Text>
          <Text style={styles.batteryArrow}>→</Text>
          <Text style={styles.batteryTextGreen}>{segment.batteryAtDeparture?.toFixed(0)}%</Text>
        </View>
      </View>
    );
  }

  if (segment.type === 'destination') {
    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentIconDestination}>
            <Ionicons name="flag-outline" size={18} color="#050816" />
          </View>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentTitle}>{segment.location}</Text>
            <Text style={styles.segmentSubtitle}>Destination</Text>
          </View>
          <Text style={styles.batteryText}>{segment.batteryAtArrival.toFixed(0)}%</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#E5E7EB',
    marginTop: 15,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FCA5A5',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#050816',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    maxHeight: '65%',
    backgroundColor: '#050816',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 18,
  },
  bottomSheetCollapsed: {
    maxHeight: 60,
    paddingTop: 5,
  },
  toggleButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,244,112,0.08)',
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.3)',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00F470',
  },
  handle: {
    width: 50,
    height: 4,
    backgroundColor: '#1F2933',
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  titleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,244,112,0.06)',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#0B1020',
    borderRadius: 16,
    marginBottom: 18,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 6,
    marginBottom: 10,
  },
  segmentCard: {
    backgroundColor: '#0B1020',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  segmentCardCharging: {
    backgroundColor: 'rgba(0,244,112,0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.7)',
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  segmentIconStart: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#93C5FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconTravel: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconCharging: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: ACCENT_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconDestination: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 4,
  },
  segmentTitleCharging: {
    fontSize: 15,
    fontWeight: '700',
    color: ACCENT_GREEN,
    marginBottom: 4,
  },
  segmentSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  chargingCost: {
    fontSize: 12,
    color: ACCENT_GREEN,
    fontWeight: '600',
    marginTop: 2,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  batteryTextGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT_GREEN,
  },
  batteryChange: {
    alignItems: 'center',
    marginTop: 10,
  },
  batteryArrow: {
    fontSize: 12,
    color: '#9CA3AF',
    marginVertical: 2,
  },
  instructionsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31,41,55,0.7)',
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 3,
    paddingLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(31,41,55,0.8)',
    marginVertical: 16,
  },
  dividerThin: {
    height: 1,
    backgroundColor: 'rgba(31,41,55,0.6)',
    marginVertical: 8,
  },
  costSummary: {
    backgroundColor: '#0B1020',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  costLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  costValue: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  costLabelBold: {
    fontSize: 14,
    color: '#F9FAFB',
    fontWeight: '700',
  },
  costValueBold: {
    fontSize: 14,
    color: ACCENT_GREEN,
    fontWeight: '700',
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 6,
    marginBottom: 12,
  },
  reserveButtonText: {
    color: '#050816',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  noChargingNeeded: {
    backgroundColor: 'rgba(0,244,112,0.06)',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.6)',
  },
  noChargingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 4,
  },
  noChargingSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 28,
  },
});
