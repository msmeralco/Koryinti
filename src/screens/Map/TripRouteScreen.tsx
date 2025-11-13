import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';
import { calculateDetailedRoute } from '@/services/routeCalculationEngine';
import { DetailedRoute, RouteSegment } from '@/types/route-calculation';

type Props = NativeStackScreenProps<MapStackParamList, 'TripRoute'>;

export default function TripRouteScreen({ navigation, route }: Props) {
  const { from, to, currentBatteryPercent = 80, minimumArrivalBattery = 25 } = route.params;

  const [detailedRoute, setDetailedRoute] = useState<DetailedRoute | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        <ActivityIndicator size="large" color="#4CAF50" />
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
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
      >
        {/* Route polyline */}
        <Polyline coordinates={detailedRoute.polyline} strokeColor="#4CAF50" strokeWidth={4} />

        {/* Charging station markers */}
        {detailedRoute.chargingStops.map((stop, index) => {
          console.warn(`� Rendering charging marker ${index + 1}:`, {
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
              pinColor="#4CAF50"
            />
          );
        })}

        {/* Start marker */}
        <Marker
          coordinate={detailedRoute.segments[0].coordinates}
          title="Start"
          description={from}
          pinColor="#2196F3"
        />

        {/* Destination marker */}
        <Marker
          coordinate={detailedRoute.segments[detailedRoute.segments.length - 1].coordinates}
          title="Destination"
          description={to}
          pinColor="#F44336"
        />
      </MapView>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Suggested Route</Text>
          <Text style={styles.subtitle}>
            {from} → {to}
          </Text>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{detailedRoute.totalDistance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.floor(detailedRoute.totalDuration / 60)}h {detailedRoute.totalDuration % 60}m
              </Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{detailedRoute.chargingStops.length}</Text>
              <Text style={styles.statLabel}>Charging Stops</Text>
            </View>
          </View>

          {/* Route Details */}
          <Text style={styles.sectionTitle}>Route Details</Text>
          {detailedRoute.segments.map(segment => (
            <RouteSegmentCard key={segment.id} segment={segment} />
          ))}

          {/* Cost Summary */}
          {detailedRoute.chargingStops.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Cost Summary</Text>
              <View style={styles.costSummary}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Total Distance</Text>
                  <Text style={styles.costValue}>{detailedRoute.totalDistance} km</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Total Travel Time</Text>
                  <Text style={styles.costValue}>
                    {Math.floor(detailedRoute.totalTravelTime / 60)}h{' '}
                    {detailedRoute.totalTravelTime % 60}m
                  </Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Charging Time</Text>
                  <Text style={styles.costValue}>{detailedRoute.totalChargingTime} min</Text>
                </View>
                <View style={styles.dividerThin} />
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Charging Cost</Text>
                  <Text style={styles.costValue}>
                    ₱{detailedRoute.costBreakdown.chargingCost.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Booking Fee (2%)</Text>
                  <Text style={styles.costValue}>
                    ₱{detailedRoute.costBreakdown.bookingFee.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Service Fee</Text>
                  <Text style={styles.costValue}>
                    ₱{detailedRoute.costBreakdown.serviceFee.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.dividerThin} />
                <View style={styles.costRow}>
                  <Text style={styles.costLabelBold}>Total Cost</Text>
                  <Text style={styles.costValueBold}>
                    ₱{detailedRoute.costBreakdown.totalCost.toFixed(2)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.reserveButton} onPress={handleReserveChargers}>
                <Text style={styles.reserveButtonText}>Reserve Chargers</Text>
              </TouchableOpacity>
            </>
          )}

          {detailedRoute.chargingStops.length === 0 && (
            <View style={styles.noChargingNeeded}>
              <Text style={styles.noChargingText}>✅ No charging needed!</Text>
              <Text style={styles.noChargingSubtext}>Your battery is sufficient for this trip</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </View>
  );
}

function RouteSegmentCard({ segment }: { segment: RouteSegment }) {
  if (segment.type === 'start') {
    return (
      <View style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentIconStart}>
            <Text style={styles.segmentIconText}>🚗</Text>
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
            <Text style={styles.segmentIconText}>→</Text>
          </View>
          <View style={styles.segmentInfo}>
            <Text style={styles.segmentTitle}>Traveling to next point</Text>
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
            <Text style={styles.instructionsTitle}>Route Instructions:</Text>
            {segment.instructions.slice(0, 3).map((instruction, idx) => (
              <Text key={idx} style={styles.instructionText}>
                • {instruction.instruction}
              </Text>
            ))}
            {segment.instructions.length > 3 && (
              <Text style={styles.instructionText}>
                ... and {segment.instructions.length - 3} more steps
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
            <Text style={styles.segmentIconText}>🔋</Text>
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
          <Text style={styles.batteryArrow}>↓</Text>
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
            <Text style={styles.segmentIconText}>🏁</Text>
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
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    maxHeight: '65%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
    marginBottom: 12,
  },
  segmentCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  segmentCardCharging: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  segmentIconStart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconTravel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconCharging: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconDestination: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentIconText: {
    fontSize: 20,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  segmentTitleCharging: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  segmentSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  chargingCost: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  batteryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  batteryTextGreen: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  batteryChange: {
    alignItems: 'center',
  },
  batteryArrow: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
    paddingLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  dividerThin: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  costSummary: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  costLabelBold: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  costValueBold: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  noChargingNeeded: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  noChargingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  noChargingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});
