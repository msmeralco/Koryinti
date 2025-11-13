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
        <Text style={[styles.availability, isFull && {color:'#d32f2f'}]}>{station.availablePlugs} of {station.totalPlugs} chargers available</Text>
        <Text style={styles.text}>In use: {station.plugsInUse}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.text}>{station.address}</Text>
        <Text style={styles.text}>{station.state}</Text>
        <Text style={styles.text}>Distance: {station.distanceKm.toFixed(2)} km • {station.driveMinutes.toFixed(0)} min est. drive</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <Text style={styles.text}>₱{station.pricePerKWh.toFixed(2)}/kWh (est.)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charging Power</Text>
        <Text style={styles.text}>{station.powerKW.toFixed(0)} kW aggregate (est.)</Text>
        {station.plugTypes && station.plugTypes.length > 0 ? (
          <View>
            <Text style={styles.text}>Plug Types: {station.plugTypes.slice(0, Math.ceil(station.plugTypes.length / 2)).join(', ')}</Text>
            {station.plugTypes.length > Math.ceil(station.plugTypes.length / 2) && (
              <Text style={styles.text}>{station.plugTypes.slice(Math.ceil(station.plugTypes.length / 2)).join(', ')}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.text}>Plug Types: Unknown</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        {amenityList.map(a => (
          <Text key={a.key} style={styles.text}>• {a.label}: {station.amenities[a.key] ? 'Yes' : 'No'}</Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.primaryButton, isFull && {backgroundColor:'#9e9e9e'}]} disabled={isFull} onPress={handleReserve}>
          <Text style={styles.buttonText}>{isFull ? 'Full / Unavailable' : 'Reserve'}</Text>
        </TouchableOpacity>
        {/* Removed Directions and Plan a Trip actions per new UX spec */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A10',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#08121a',
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  rating: {
    fontSize: 16,
    color: '#C6CFD7',
  },
  subHeader: {
    fontSize: 14,
    color: '#C6CFD7',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#08121a',
    backgroundColor: '#07111a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#C6CFD7',
    marginBottom: 5,
  },
  availability: {
    fontSize: 18,
    fontWeight: '600',
    color: '#46F98C',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#46F98C',
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0,
  },
  buttonText: {
    color: '#02110A',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#C6CFD7',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
