import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'StationProfile'>;

/**
 * StationProfileScreen displays detailed information about a charging station
 * including address, amenities, pricing, and available actions:
 * - Reserve a charger
 * - Get directions
 * - Plan a trip through this station
 */
export default function StationProfileScreen({ navigation, route }: Props) {
  const { stationId } = route.params;

  const handleReserve = () => {
    navigation.navigate('ReserveStation', { stationId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stationName}>Downtown Charging Hub</Text>
        <Text style={styles.rating}>⭐ 4.5 (120 reviews)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <Text style={styles.availability}>3 of 6 chargers available</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.text}>123 Main Street</Text>
        <Text style={styles.text}>Downtown, City 12345</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <Text style={styles.text}>$0.35/kWh</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charging Speed</Text>
        <Text style={styles.text}>Level 3 DC Fast Charging (150kW)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <Text style={styles.text}>• Restrooms</Text>
        <Text style={styles.text}>• WiFi</Text>
        <Text style={styles.text}>• Coffee Shop Nearby</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleReserve}>
          <Text style={styles.buttonText}>Reserve</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('PlanTrip')}
        >
          <Text style={styles.secondaryButtonText}>Plan a Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  availability: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
