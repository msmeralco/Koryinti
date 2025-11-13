import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'TripRoute'>;

const SUGGESTED_STATIONS = [
  { id: '1', name: 'Highway Rest Stop A', distance: '45 mi', time: '8:30 AM' },
  { id: '2', name: 'Midway Charging Plaza', distance: '120 mi', time: '11:00 AM' },
  { id: '3', name: 'Destination Chargers', distance: '180 mi', time: '1:30 PM' },
];

/**
 * TripRouteScreen displays the suggested route with recommended
 * charging stops. Users can view the full route details and proceed
 * to reserve chargers at the suggested stations.
 */
export default function TripRouteScreen({ navigation, route }: Props) {
  const { from, to } = route.params;

  const handleReserveChargers = () => {
    const stationIds = SUGGESTED_STATIONS.map(s => s.id);
    navigation.navigate('ReservationDetails', {
      routeId: 'route-123',
      stations: stationIds,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Route Map</Text>
        <Text style={styles.mapSubtext}>
          {from} → {to}
        </Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <ScrollView style={styles.content}>
          <Text style={styles.title}>Suggested Route</Text>

          <View style={styles.routeInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>180 mi</Text>
              <Text style={styles.infoLabel}>Distance</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>3h 45m</Text>
              <Text style={styles.infoLabel}>Est. Time</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>3 stops</Text>
              <Text style={styles.infoLabel}>Charging</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Charging Stops</Text>
          {SUGGESTED_STATIONS.map(station => (
            <View key={station.id} style={styles.stationCard}>
              <View style={styles.stationInfo}>
                <Text style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationDetail}>
                  {station.distance} • {station.time}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.reserveButton} onPress={handleReserveChargers}>
            <Text style={styles.reserveButtonText}>Reserve Chargers</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
    fontSize: 14,
    color: '#666',
  },
  reserveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
