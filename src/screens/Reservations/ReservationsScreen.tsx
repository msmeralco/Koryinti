import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const MOCK_RESERVATIONS = [
  {
    id: '1',
    station: 'Downtown Charging Hub',
    date: 'Nov 15, 2025',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: '2',
    station: 'Mall Plaza Station',
    date: 'Nov 10, 2025',
    time: '2:00 PM',
    status: 'completed',
  },
  {
    id: '3',
    station: 'Highway Rest Stop A',
    date: 'Nov 8, 2025',
    time: '11:30 AM',
    status: 'completed',
  },
];

/**
 * ReservationsScreen displays a list of user's past and upcoming
 * charging station reservations with their current status.
 */
export default function ReservationsScreen() {
  const renderReservation = ({ item }: { item: (typeof MOCK_RESERVATIONS)[0] }) => (
    <TouchableOpacity style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.stationName}>{item.station}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'upcoming' ? styles.upcomingBadge : styles.completedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>📅 {item.date}</Text>
        <Text style={styles.detailText}>🕒 {item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_RESERVATIONS}
        renderItem={renderReservation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reservations yet</Text>
            <Text style={styles.emptySubtext}>
              Start by finding a nearby charging station
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stationName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upcomingBadge: {
    backgroundColor: '#4CAF50',
  },
  completedBadge: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
  },
});
