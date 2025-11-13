import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ConfirmPayment'>;

/**
 * ConfirmPaymentScreen shows the final reservation details
 * and handles payment processing (mock for MVP).
 */
export default function ConfirmPaymentScreen({ navigation, route }: Props) {
  const { reservationDetails } = route.params;

  const handleConfirmPayment = () => {
    // Create a mock EnrichedStation since we only have stationId
    // In a real app, you would fetch the full station details from API
    const mockStation = {
      id: reservationDetails.stationId,
      title: 'Charging Station',
      address: 'Address not available',
      latitude: 0,
      longitude: 0,
      totalPlugs: 4,
      plugsInUse: 1,
      availablePlugs: 3,
      plugTypes: ['Type 2', 'CCS'],
      powerKW: 50,
      distanceKm: 0,
      driveMinutes: 0,
      rating: 4.5,
      pricePerKWh: reservationDetails.estimatedCost / reservationDetails.duration / 20,
      amenities: {
        wifi: true,
        bathroom: true,
        pwdFriendly: true,
        waitingLounge: true,
      },
      state: '',
    };
    navigation.navigate('ReservationDetails', {
      routeId: 'mock-route-id',
      stations: [mockStation],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Confirm Your Reservation</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{reservationDetails.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Duration:</Text>
          <Text style={styles.value}>{reservationDetails.duration} hour(s)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Payment Details</Text>
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentText}>💳 •••• 4242</Text>
          <TouchableOpacity>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${reservationDetails.estimatedCost.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
        <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        You will be charged only for the actual energy consumed. The estimated amount is a
        reservation fee.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
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
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  changeText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalSection: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  confirmButton: {
    margin: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
