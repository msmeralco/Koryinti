import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'StationProfile'>;

/**
 * StationProfileScreen displays detailed information about a charging station
 * including address, amenities, pricing, and available actions:
 * - Reserve a charger
 * - Get directions
 * - Plan a trip through this station
 */
export default function StationProfileScreen({ navigation, route }: Props) {
  const { station } = route.params;

  const handleReserve = () => {
    navigation.navigate('ReserveStation', { stationId: station.id });
  };

  const isFull = station.availablePlugs <= 0;
  const amenityList: { label: string; key: keyof EnrichedStation['amenities'] }[] = [
    { label: 'WiFi', key: 'wifi' },
    { label: 'Bathroom', key: 'bathroom' },
    { label: 'PWD Friendly', key: 'pwdFriendly' },
    { label: 'Waiting Lounge', key: 'waitingLounge' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stationName}>{station.title}</Text>
        <Text style={styles.rating}>⭐ {station.rating.toFixed(1)}</Text>
        <Text style={styles.subHeader}>{station.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <Text style={[styles.availability, isFull && { color: '#d32f2f' }]}>
          {station.availablePlugs} of {station.totalPlugs} chargers available
        </Text>
        <Text style={styles.text}>In use: {station.plugsInUse}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.text}>{station.address}</Text>
        <Text style={styles.text}>{station.state}</Text>
        <Text style={styles.text}>
          Distance: {station.distanceKm.toFixed(2)} km • {station.driveMinutes.toFixed(0)} min est.
          drive
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <Text style={styles.text}>₱{station.pricePerKWh.toFixed(2)}/kWh (est.)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charging Power</Text>
        <Text style={styles.text}>{station.powerKW.toFixed(0)} kW aggregate (est.)</Text>
        <Text style={styles.text}>Plug Types: {station.plugTypes.join(', ') || 'Unknown'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        {amenityList.map(a => (
          <Text key={a.key} style={styles.text}>
            • {a.label}: {station.amenities[a.key] ? 'Yes' : 'No'}
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, isFull && { backgroundColor: '#9e9e9e' }]}
          disabled={isFull}
          onPress={handleReserve}
        >
          <Text style={styles.buttonText}>{isFull ? 'Full / Unavailable' : 'Reserve'}</Text>
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
  subHeader: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
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
