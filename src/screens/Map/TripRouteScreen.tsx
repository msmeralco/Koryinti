import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList, Route } from '@/types/navigation';
import { useState, useEffect } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { calculateRoute } from '@/services/routeService';

type Props = NativeStackScreenProps<MapStackParamList, 'TripRoute'>;

/**
 * TripRouteScreen displays the suggested route with recommended
 * charging stops. Users can view the full route details and proceed
 * to reserve chargers at the suggested stations.
 */
export default function TripRouteScreen({ navigation, route }: Props) {
  const { from, to } = route.params;
  const [calculatedRoute, setCalculatedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  // Map region centered on Manila
  const [region] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });

  useEffect(() => {
    // Calculate route when component mounts
    const fetchRoute = async () => {
      setLoading(true);
      try {
        const result = await calculateRoute({ from, to });
        setCalculatedRoute(result);
      } catch (error) {
        console.error('Error calculating route:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [from, to]);

  const handleReserveChargers = () => {
    if (calculatedRoute) {
      const stationIds = calculatedRoute.suggestedStations.map(s => s.id);
      navigation.navigate('ReservationDetails', {
        routeId: calculatedRoute.id,
        stations: stationIds,
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Calculating optimal route...</Text>
      </View>
    );
  }

  if (!calculatedRoute) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Unable to calculate route</Text>
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
        {/* Markers for charging stations */}
        {calculatedRoute.suggestedStations.map(station => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            description={`${station.chargingSpeed} • ₱${station.pricePerKwh}/kWh`}
            pinColor="#4CAF50"
          />
        ))}

        {/* Mock route line (in real app, use actual route polyline from API) */}
        {calculatedRoute.suggestedStations.length > 0 && (
          <Polyline
            coordinates={calculatedRoute.suggestedStations.map(s => ({
              latitude: s.latitude,
              longitude: s.longitude,
            }))}
            strokeColor="#4CAF50"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <ScrollView style={styles.content}>
          <Text style={styles.title}>Suggested Route</Text>
          <Text style={styles.subtitle}>
            {from} → {to}
          </Text>

          <View style={styles.routeInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{calculatedRoute.distance} km</Text>
              <Text style={styles.infoLabel}>Distance</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{calculatedRoute.estimatedTime}h</Text>
              <Text style={styles.infoLabel}>Est. Time</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{calculatedRoute.suggestedStations.length} stops</Text>
              <Text style={styles.infoLabel}>Charging</Text>
            </View>
          </View>

          {calculatedRoute.suggestedStations.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Recommended Charging Stops</Text>
              {calculatedRoute.suggestedStations.map((station, index) => (
                <TouchableOpacity
                  key={station.id}
                  style={styles.stationCard}
                  onPress={() => navigation.navigate('StationProfile', { stationId: station.id })}
                >
                  <View style={styles.stationNumber}>
                    <Text style={styles.stationNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <Text style={styles.stationDetail}>{station.address}</Text>
                    <Text style={styles.stationDetail}>
                      {station.chargingSpeed} • ₱{station.pricePerKwh}/kWh • ⭐ {station.rating}
                    </Text>
                    <Text style={styles.stationAvailability}>
                      {station.availableChargers}/{station.totalChargers} available
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.reserveButton} onPress={handleReserveChargers}>
                <Text style={styles.reserveButtonText}>Reserve Chargers</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noStopsContainer}>
              <Text style={styles.noStopsText}>✅ No charging stops needed for this trip!</Text>
              <Text style={styles.noStopsSubtext}>
                Your current battery level is sufficient for this journey.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    maxHeight: '60%',
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
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  stationCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  stationNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  stationDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  stationAvailability: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 3,
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  noStopsContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noStopsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  noStopsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
