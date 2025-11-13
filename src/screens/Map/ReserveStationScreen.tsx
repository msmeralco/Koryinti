import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ReserveStation'>;

/**
 * ReserveStationScreen allows users to select a time slot and duration
 * for their charging session before proceeding to payment confirmation.
 */
const ACCENT_GREEN = '#00F470';

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
    // Navigate directly to ReservationDetails with a mock EnrichedStation (keeps behaviour like before)
    const mockStation = {
      id: stationId,
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

    navigation.navigate('ReservationDetails', { routeId: 'res-' + Date.now(), stations: [mockStation] });
  };

  const estimatedCost = duration * 12.5;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header pill */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerBadge}>
            <Ionicons name="flash-outline" size={16} color={ACCENT_GREEN} />
            <Text style={styles.headerBadgeText}>Reserve a time slot</Text>
          </View>
          <Text style={styles.headerTitle}>When would you like to charge?</Text>
          <Text style={styles.headerSubtitle}>
            Pick a start time and duration for this station.
          </Text>
        </View>

        {/* Time selection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="time-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.sectionTitle}>Select time</Text>
            </View>
          </View>
          <View style={styles.timeSlots}>
            {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM'].map(time => {
              const selected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, selected && styles.selectedTimeSlot]}
                  onPress={() => setSelectedTime(time)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.timeText, selected && styles.selectedTimeText]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Duration selection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="battery-half-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.sectionTitle}>Duration (hours)</Text>
            </View>
          </View>
          <View style={styles.durationButtons}>
            {[0.5, 1, 1.5, 2, 3].map(hours => {
              const selected = duration === hours;
              return (
                <TouchableOpacity
                  key={hours}
                  style={[styles.durationButton, selected && styles.selectedDuration]}
                  onPress={() => setDuration(hours)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.durationText, selected && styles.selectedDurationText]}
                  >
                    {hours}h
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="receipt-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.summaryTitle}>Reservation summary</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Station</Text>
            <Text style={styles.summaryValue}>Downtown Charging Hub</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{selectedTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{duration} hour(s)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated cost</Text>
            <Text style={styles.summaryValueHighlight}>
              ₱{estimatedCost.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.9}>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={20}
            color="#050816"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.confirmButtonText}>Continue to payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const ACCENT_BG = '#0B1020';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerWrapper: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,244,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.5)',
    marginBottom: 10,
  },
  headerBadgeText: {
    color: ACCENT_GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  sectionCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: ACCENT_BG,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    backgroundColor: '#050816',
  },
  selectedTimeSlot: {
    backgroundColor: ACCENT_GREEN,
    borderColor: ACCENT_GREEN,
  },
  timeText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  selectedTimeText: {
    color: '#050816',
    fontWeight: '600',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDuration: {
    backgroundColor: ACCENT_GREEN,
    borderColor: ACCENT_GREEN,
  },
  durationText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  selectedDurationText: {
    color: '#050816',
    fontWeight: '600',
  },
  summaryCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: ACCENT_BG,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  summaryValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT_GREEN,
  },
  confirmButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingVertical: 14,
    borderRadius: 999,
  },
  confirmButtonText: {
    color: '#050816',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
