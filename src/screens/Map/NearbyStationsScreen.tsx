import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'NearbyStations'>;

const formatDistance = (km: number) =>
  km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;

export default function NearbyStationsScreen({ navigation, route }: Props) {
  const { stations } = route.params;
  const [sortKey, setSortKey] = React.useState<'distance' | 'rating' | 'availability'>('distance');
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);
  const [plugFilter, setPlugFilter] = React.useState<string | null>(null);

  const filtered = stations.filter(s => {
    if (showAvailableOnly && s.availablePlugs <= 0) return false;
    if (plugFilter && !s.plugTypes.includes(plugFilter)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'rating':
        return b.rating - a.rating;
      case 'availability':
        return b.availablePlugs / b.totalPlugs - a.availablePlugs / a.totalPlugs;
      default:
        return a.distanceKm - b.distanceKm;
    }
  });

  const distinctPlugTypes = Array.from(new Set(stations.flatMap(s => s.plugTypes))).slice(0, 6);

  const renderStation = ({ item }: { item: EnrichedStation }) => (
    <TouchableOpacity
      style={styles.stationCard}
      onPress={() => navigation.navigate('StationProfile', { station: item })}
    >
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.title}</Text>
        <Text style={styles.stationDistance}>
          {formatDistance(item.distanceKm)} • {item.driveMinutes.toFixed(0)} min drive
        </Text>
        <Text style={styles.stationMeta}>{item.plugTypes.join(', ') || 'Unknown plugs'}</Text>
      </View>
      <View style={styles.availabilityInfo}>
        <Text style={[styles.availableText, item.availablePlugs === 0 && { color: '#d32f2f' }]}>
          {item.availablePlugs}/{item.totalPlugs}
        </Text>
        <Text style={styles.availableLabel}>Available</Text>
        <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() =>
            setSortKey(
              sortKey === 'distance' ? 'rating' : sortKey === 'rating' ? 'availability' : 'distance'
            )
          }
        >
          <Text style={styles.controlBtnText}>Sort: {sortKey}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => setShowAvailableOnly(v => !v)}>
          <Text style={styles.controlBtnText}>
            {showAvailableOnly ? 'Showing Available' : 'All Stations'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        {distinctPlugTypes.map(pt => (
          <TouchableOpacity
            key={pt}
            style={[styles.filterChip, plugFilter === pt && styles.filterChipActive]}
            onPress={() => setPlugFilter(plugFilter === pt ? null : pt)}
          >
            <Text style={[styles.filterChipText, plugFilter === pt && styles.filterChipTextActive]}>
              {pt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={sorted}
        renderItem={renderStation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{ padding: 20 }}>No stations match filters.</Text>}
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
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    gap: 12,
  },
  controlBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  controlBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
  },
  filterChipText: {
    color: '#2196F3',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#fff',
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
  stationMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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
  rating: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
});
