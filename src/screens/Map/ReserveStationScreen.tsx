import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { useState } from 'react';

type Props = NativeStackScreenProps<MapStackParamList, 'ReserveStation'>;

/**
 * ReserveStationScreen allows users to select a time slot and duration
 * for their charging session before proceeding to payment confirmation.
 */
export default function ReserveStationScreen({ navigation, route }: Props) {
  const { stationId } = route.params;
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [duration, setDuration] = useState(1);

  const handleConfirm = () => {
    const reservationDetails = {
      stationId,
      date: new Date().toISOString(),
      time: selectedTime,
      duration,
      estimatedCost: duration * 12.5,
    };
    navigation.navigate('ConfirmPayment', { stationId, reservationDetails });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Select Time</Text>
        <View style={styles.timeSlots}>
          {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM'].map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.timeSlot, selectedTime === time && styles.selectedTimeSlot]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Duration (hours)</Text>
        <View style={styles.durationButtons}>
          {[0.5, 1, 1.5, 2, 3].map(hours => (
            <TouchableOpacity
              key={hours}
              style={[styles.durationButton, duration === hours && styles.selectedDuration]}
              onPress={() => setDuration(hours)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === hours && styles.selectedDurationText,
                ]}
              >
                {hours}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Reservation Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Station:</Text>
          <Text style={styles.summaryValue}>Downtown Charging Hub</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>{selectedTime}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{duration} hour(s)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Cost:</Text>
          <Text style={styles.summaryValue}>${(duration * 12.5).toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
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
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedTimeSlot: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: '600',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedDuration: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  durationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedDurationText: {
    color: '#fff',
    fontWeight: '600',
  },
  summary: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
});
