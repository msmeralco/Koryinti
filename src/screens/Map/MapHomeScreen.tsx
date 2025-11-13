import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'MapHome'>;

/**
 * MapHomeScreen is the main map interface showing the user's location
 * and available charging stations. Provides two main actions:
 * - Find Nearby Stations
 * - Plan a Trip
 */
export default function MapHomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.mapSubtext}>(Expo Location & Maps will render here)</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('NearbyStations')}
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
