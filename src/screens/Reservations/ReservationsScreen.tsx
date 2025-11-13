import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getReservations, ReservationSession } from '@/services/reservationsStore';

const CarImage = require('../../../assets/carimage.png');

// Dynamic reservations retrieved from store (first item may be active)


/**
 * ReservationsScreen shows active & past charging sessions
 * styled like the Sessions mock: dark theme + hero image + green pill.
 */
export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<ReservationSession[]>(getReservations());

  // Refresh when screen gains focus (e.g. after creating a reservation on StationProfile)
  useFocusEffect(
    React.useCallback(() => {
      setReservations(getReservations());
    }, [])
  );
  const renderReservation = ({
    item,
    index,
  }: {
    item: ReservationSession;
    index: number;
  }) => {
    const isOngoing = index === 0 && item.minutesLeft > 0;

    return (
      <TouchableOpacity style={styles.sessionCard} activeOpacity={0.9}>
        {/* Big image on top */}
        <Image source={CarImage} style={styles.thumbnail} />

        {/* Text content */}
        <View style={styles.sessionContent}>
          {/* Time / status row */}
          <View style={styles.timeRow}>
            <Ionicons
              name={isOngoing ? 'time-outline' : 'checkmark-circle-outline'}
              size={16}
              color={isOngoing ? '#D0D4FF' : TEXT_MUTED}
            />
            {isOngoing ? (
              <Text style={styles.timeText}>
                <Text style={styles.timeHighlight}>{` ${item.minutesLeft} Mins.`}</Text>
                <Text style={styles.timeSuffix}> Left</Text>
              </Text>
            ) : (
              <Text style={styles.doneText}> Session Done</Text>
            )}
          </View>

          {/* Station name */}
          <Text style={styles.stationName}>{item.station}</Text>

          {/* Host & car */}
          <Text style={styles.vehicleText}>{item.vehicle}</Text>

          {/* Date & time */}
          <Text style={styles.dateText}>
            {item.date}: {item.timeRange}
          </Text>

          {/* Only first / ongoing session has the Facilitate Charging pill */}
          {isOngoing && (
            <View style={styles.pillColumn}>
              <TouchableOpacity style={styles.primaryPill} activeOpacity={0.9}>
                <MaterialCommunityIcons
                  name="flash-outline"
                  size={14}
                  color="#02040A"
                  style={styles.primaryPillIcon}
                />
                <Text style={styles.primaryPillText}>Facilitate Charging</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.screenTitle}>Sessions</Text>}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Start by finding a nearby charging station.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const NEON_GREEN = '#00F470';
const BACKGROUND = '#02040A';
const CARD_BG = '#050814';
const TEXT_MAIN = '#F5F5FF';
const TEXT_MUTED = '#A4A6C3';
const TEXT_YELLOW = '#FFD45C';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: NEON_GREEN,
    marginBottom: 24,
  },
  sessionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 16,
    marginBottom: 22,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 24,
    marginBottom: 14,
  },
  sessionContent: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  timeHighlight: {
    color: TEXT_YELLOW,
    fontWeight: '700',
  },
  timeSuffix: {
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  doneText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  stationName: {
    fontSize: 18,
    fontWeight: '800',
    color: NEON_GREEN,
    marginBottom: 6,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MAIN,
  },
  vehicleText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  pillColumn: {
    flexDirection: 'column',
    marginTop: 4,
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: NEON_GREEN,
  },
  primaryPillIcon: {
    marginRight: 6,
  },
  primaryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#02040A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
});
