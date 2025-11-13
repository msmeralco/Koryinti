import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ReservationDetails'>;

const ACCENT_GREEN = '#00F470';

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Status pill */}
        <View style={styles.statusWrapper}>
          <View style={styles.statusBadge}>
            <Ionicons name="flash-outline" size={16} color={ACCENT_GREEN} />
            <Text style={styles.statusText}>Active reservation</Text>
          </View>
          <Text style={styles.statusSubtext}>
            Your chargers are reserved along this trip. Scan the QR upon arrival.
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
            <Text style={styles.value}>10:00 AM</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>1 hour</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Stations</Text>
            <Text style={styles.value}>{stations.length} stop(s)</Text>
          </View>
        </View>

        {/* Trip stations */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="navigate-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.sectionTitle}>Trip stations</Text>
            </View>
          </View>

          {stations.map(station => (
            <View key={station.id} style={styles.stationCard}>
              <View style={styles.stationHeaderRow}>
                <View style={styles.stationTitleWrap}>
                  <View style={styles.stationIcon}>
                    <MaterialCommunityIcons name="ev-station" size={18} color="#050816" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stationName}>{station.title}</Text>
                    <Text style={styles.stationAddress}>{station.address}</Text>
                  </View>
                </View>
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text style={styles.ratingText}>{station.rating.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.stationInfoRow}>
                <Ionicons name="car-outline" size={14} color="#9CA3AF" />
                <Text style={styles.stationInfo}>
                  {station.distanceKm.toFixed(1)} km • {station.driveMinutes.toFixed(0)} min drive
                </Text>
              </View>

              <View style={styles.stationInfoRow}>
                <MaterialCommunityIcons name="power-plug-outline" size={14} color="#9CA3AF" />
                <Text style={styles.stationInfo}>
                  Plugs: {station.availablePlugs}/{station.totalPlugs} available (In use:{' '}
                  {station.plugsInUse})
                </Text>
              </View>

              <View style={styles.stationInfoRow}>
                <MaterialCommunityIcons name="flash-outline" size={14} color="#9CA3AF" />
                <Text style={styles.stationInfo}>
                  {station.powerKW.toFixed(0)} kW • Types: {station.plugTypes.join(', ') || 'N/A'}
                </Text>
              </View>

              <View style={styles.stationInfoRow}>
                <Ionicons name="pricetag-outline" size={14} color="#9CA3AF" />
                <Text style={styles.stationInfo}>
                  Est. stop cost: ₱{(station.pricePerKWh * energyPerStopKWh).toFixed(2)}
                </Text>
              </View>

              <View style={styles.stationInfoRow}>
                <Ionicons name="home-outline" size={14} color="#9CA3AF" />
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
              </View>

              <View style={styles.stationFooterRow}>
                <TouchableOpacity
                  style={[
                    styles.reserveBtn,
                    station.availablePlugs === 0 && styles.reserveBtnDisabled,
                  ]}
                  disabled={station.availablePlugs === 0}
                  onPress={() => navigation.navigate('ReserveStation', { stationId: station.id })}
                >
                  <Ionicons
                    name={station.availablePlugs === 0 ? 'close-circle-outline' : 'flash-outline'}
                    size={16}
                    color={station.availablePlugs === 0 ? '#9CA3AF' : '#050816'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.reserveBtnText}>
                    {station.availablePlugs === 0 ? 'Full' : 'Reserve'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Cost summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="wallet-outline" size={18} color={ACCENT_GREEN} />
              <Text style={styles.sectionTitle}>Cost summary</Text>
            </View>
          </View>

          {stationCosts.map(sc => (
            <View key={sc.id} style={styles.detailRow}>
              <Text style={styles.label}>Station {sc.id}</Text>
              <Text style={styles.value}>₱{sc.cost.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.dividerThin} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total estimated</Text>
            <Text style={styles.totalValue}>₱{totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleScanQR}>
            <Ionicons name="qr-code-outline" size={18} color="#050816" style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>Scan QR code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
            <Ionicons name="close-outline" size={18} color="#E5E7EB" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryButtonText}>Cancel reservation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryGhostButton}>
            <Ionicons
              name="warning-outline"
              size={18}
              color="#FBBF24"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.secondaryGhostButtonText}>Report issue</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 32,
  },
  statusWrapper: {
    paddingHorizontal: 20,
    paddingTop: 24, // ⬅️ more padding so it doesn’t touch the Dynamic Island
    paddingBottom: 4,
  },
  statusBadge: {
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
    marginBottom: 6,
  },
  statusText: {
    color: ACCENT_GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  statusSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  totalLabel: {
    fontSize: 14,
    color: '#F9FAFB',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    color: ACCENT_GREEN,
    fontWeight: '700',
  },
  stationCard: {
    marginTop: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31,41,55,0.7)',
  },
  stationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stationTitleWrap: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  stationIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FBBF24',
  },
  stationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  stationInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    flexShrink: 1,
  },
  stationFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ACCENT_GREEN,
  },
  reserveBtnDisabled: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  reserveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#050816',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#050816',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1020',
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryGhostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
  },
  secondaryGhostButtonText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dividerThin: {
    height: 1,
    backgroundColor: 'rgba(31,41,55,0.7)',
    marginTop: 10,
    marginBottom: 10,
  },
});
