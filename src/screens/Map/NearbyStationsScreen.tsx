import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'NearbyStations'>;

const MOCK_STATIONS = [
  {
    id: '1',
    name: 'Downtown Charging Hub',
    distance: '0.5 mi',
    available: 3,
    total: 6,
  },
  {
    id: '2',
    name: 'Mall Plaza Station',
    distance: '1.2 mi',
    available: 2,
    total: 4,
  },
  {
    id: '3',
    name: 'City Park Chargers',
    distance: '2.1 mi',
    available: 5,
    total: 8,
  },
];

/**
 * NearbyStationsScreen displays a list of nearby charging stations
 * sorted by distance. Users can tap on a station to view its profile.
 */
export default function NearbyStationsScreen({ navigation }: Props) {
  const renderStation = ({ item }: { item: (typeof MOCK_STATIONS)[0] }) => (
    <TouchableOpacity
      style={styles.stationCard}
      onPress={() => navigation.navigate('StationProfile', { stationId: item.id })}
    >
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationDistance}>{item.distance} away</Text>
      </View>
      <View style={styles.availabilityInfo}>
        <Text style={styles.availableText}>
          {item.available}/{item.total}
        </Text>
        <Text style={styles.availableLabel}>Available</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_STATIONS}
        renderItem={renderStation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
  stationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  stationDistance: {
    fontSize: 14,
    color: '#666',
  },
  availabilityInfo: {
    alignItems: 'center',
  },
  availableText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  availableLabel: {
    fontSize: 12,
    color: '#666',
  },
});
