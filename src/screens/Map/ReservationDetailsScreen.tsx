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
        <Text style={styles.sectionTitle}>Station Information</Text>
        <Text style={styles.stationName}>Downtown Charging Hub</Text>
        <Text style={styles.stationAddress}>123 Main Street, Downtown</Text>
        <Text style={styles.stationInfo}>Charger #3 - 150kW DC Fast Charging</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost Summary</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Reservation Fee:</Text>
          <Text style={styles.value}>$12.50</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Estimated Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>$12.50</Text>
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
