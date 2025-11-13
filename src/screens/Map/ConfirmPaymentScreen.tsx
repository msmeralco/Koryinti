import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ConfirmPayment'>;

/**
 * ConfirmPaymentScreen shows the final reservation details
 * and handles payment processing (mock for MVP).
 */

const ACCENT_GREEN = '#00F470';
const ACCENT_BG = '#0B1020';

export default function ConfirmPaymentScreen({ navigation, route }: Props) {
  const { reservationDetails } = route.params;

  const handleConfirmPayment = () => {
    // Create a mock EnrichedStation since we only have stationId
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header pill */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerBadge}>
            <Ionicons name="shield-checkmark-outline" size={16} color={ACCENT_GREEN} />
            <Text style={styles.headerBadgeText}>Secure payment</Text>
          </View>
          <Text style={styles.headerTitle}>Confirm your reservation</Text>
          <Text style={styles.headerSubtitle}>
            Review the details before we reserve your slot and process payment.
          </Text>
        </View>

        {/* Reservation details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.sectionTitle}>Reservation details</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{reservationDetails.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{reservationDetails.duration} hour(s)</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="card-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.sectionTitle}>Payment method</Text>
            </View>
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.paymentLeft}>
              <View style={styles.cardIconCircle}>
                <Ionicons name="card-outline" size={18} color="#050816" />
              </View>
              <Text style={styles.paymentText}>•••• 4242</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalHint}>Charged after session based on usage</Text>
            </View>
            <Text style={styles.totalAmount}>
              ₱{reservationDetails.estimatedCost.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
          activeOpacity={0.9}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#050816"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.confirmButtonText}>Confirm & pay</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          You will be charged only for the actual energy consumed. The estimated amount is used as a
          reservation hold and may differ from the final charge.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingBottom: 10,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  changeText: {
    fontSize: 13,
    color: ACCENT_GREEN,
    fontWeight: '600',
  },
  totalCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: ACCENT_BG,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  totalHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: ACCENT_GREEN,
  },
  confirmButton: {
    marginTop: 22,
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
  disclaimer: {
    marginTop: 14,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
