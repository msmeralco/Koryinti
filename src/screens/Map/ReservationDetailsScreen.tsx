import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ReservationDetails'>;

/**
 * ReservationDetailsScreen displays the active or upcoming reservation
 * with options to scan QR code, cancel, or report issues.
 */
export default function ReservationDetailsScreen({ navigation, route }: Props) {
  const { stations } = route.params;

  // Synthetic assumption: each stop consumes 20 kWh.
  const energyPerStopKWh = 20;
  const stationCosts = stations.map(s => ({
    id: s.id,
    cost: s.pricePerKWh * energyPerStopKWh,
  }));
  const totalCost = stationCosts.reduce((sum, c) => sum + c.cost, 0);

  const handleScanQR = () => {
    navigation.navigate('ScanQR', { reservationId: 'res-123' });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Active Reservation</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reservation Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>10:00 AM</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Duration:</Text>
          <Text style={styles.value}>1 hour</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Stations:</Text>
          <Text style={styles.value}>{stations.length} stop(s)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Stations</Text>
        {stations.map(station => (
          <View key={station.id} style={styles.stationCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stationName}>{station.title}</Text>
              <Text style={styles.stationAddress}>{station.address}</Text>
              <Text style={styles.stationInfo}>
                Distance: {station.distanceKm.toFixed(1)} km • {station.driveMinutes.toFixed(0)} min
                drive
              </Text>
              <Text style={styles.stationInfo}>
                Plugs: {station.availablePlugs}/{station.totalPlugs} available (In use:{' '}
                {station.plugsInUse})
              </Text>
              <Text style={styles.stationInfo}>
                Power: {station.powerKW.toFixed(0)} kW • Types:{' '}
                {station.plugTypes.join(', ') || 'N/A'}
              </Text>
              <Text style={styles.stationInfo}>
                Amenities:{' '}
                {['WiFi', 'Bathroom', 'PWD', 'Lounge']
                  .filter(
                    (_, i) =>
                      [
                        station.amenities.wifi,
                        station.amenities.bathroom,
                        station.amenities.pwdFriendly,
                        station.amenities.waitingLounge,
                      ][i]
                  )
                  .join(', ') || 'None'}
              </Text>
              <Text style={styles.stationInfo}>Rating: ⭐ {station.rating.toFixed(1)}</Text>
              <Text style={styles.stationInfo}>
                Est. Stop Cost: ₱{(station.pricePerKWh * energyPerStopKWh).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.reserveBtn, station.availablePlugs === 0 && styles.reserveBtnDisabled]}
              disabled={station.availablePlugs === 0}
              onPress={() => navigation.navigate('ReserveStation', { stationId: station.id })}
            >
              <Text style={styles.reserveBtnText}>
                {station.availablePlugs === 0 ? 'Full' : 'Reserve'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost Summary</Text>
        {stationCosts.map(sc => (
          <View key={sc.id} style={styles.detailRow}>
            <Text style={styles.label}>Station {sc.id}:</Text>
            <Text style={styles.value}>₱{sc.cost.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Estimated:</Text>
          <Text style={[styles.value, styles.totalValue]}>₱{totalCost.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleScanQR}>
          <Text style={styles.primaryButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
          <Text style={styles.secondaryButtonText}>Cancel Reservation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Report Issue</Text>
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
  statusBadge: {
    backgroundColor: '#4CAF50',
    padding: 15,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    color: '#4CAF50',
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  stationInfo: {
    fontSize: 14,
    color: '#666',
  },
  stationCard: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  reserveBtn: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  reserveBtnDisabled: {
    backgroundColor: '#9e9e9e',
  },
  reserveBtnText: {
    color: '#fff',
    fontWeight: '600',
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
