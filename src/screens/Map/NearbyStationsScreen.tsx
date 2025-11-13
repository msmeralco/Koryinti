import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList, EnrichedStation } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'NearbyStations'>;

const formatDistance = (km: number) =>
  km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;

export default function NearbyStationsScreen({ navigation, route }: Props) {
  const { stations } = route.params;
  const sortLabels: Record<typeof sortKey, string> = {
    distance: 'Distance',
    rating: 'Rating',
    availability: 'Availability',
  };
  const [sortKey, setSortKey] = React.useState<'distance'|'rating'|'availability'>('distance');
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);
  const [plugFilter, setPlugFilter] = React.useState<string | null>(null);
  const [showFiltersOpen, setShowFiltersOpen] = React.useState(false);
  const [showSortOpen, setShowSortOpen] = React.useState(false);
  const [showRangeOpen, setShowRangeOpen] = React.useState(false);
  const [rangeKm, setRangeKm] = React.useState<number>(10);
  const rangeSteps = [5, 10, 15, 20, 30, 40, 50];

  const filtered = stations.filter(s => {
    if (showAvailableOnly && s.availablePlugs <= 0) return false;
    if (plugFilter && !s.plugTypes.includes(plugFilter)) return false;
    // respect the selected range: only include stations within rangeKm
    if (typeof s.distanceKm === 'number' && s.distanceKm > rangeKm) return false;
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
        <Text style={styles.stationDistance}>{formatDistance(item.distanceKm)} • {item.driveMinutes.toFixed(0)} min drive</Text>
        <View style={{marginTop:6}}>
          {item.plugTypes.length >= 2 ? (
            // show up to two details on separate lines
            item.plugTypes.slice(0,2).map((pt, idx) => (
              <View key={`${item.id}-${pt}-${idx}`} style={{flexDirection:'row', alignItems:'center', marginBottom:4, maxWidth: 220}}>
                <Feather name="zap" size={14} color="#FFD54F" style={{marginRight:8}} />
                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.stationMeta, {flexShrink:1}]}>{pt}</Text>
              </View>
            ))
          ) : (
            <View style={{flexDirection:'row', alignItems:'center'}}>
              {item.plugTypes.length === 1 ? (
                <>
                  <Feather name="zap" size={14} color="#FFD54F" style={{marginRight:8}} />
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.stationMeta, {flexShrink:1, maxWidth: 220}]}>{item.plugTypes[0]}</Text>
                </>
              ) : (
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.stationMeta}>Unknown plugs</Text>
              )}
            </View>
          )}
        </View>
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
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Nearby Stations</Text>
            <Text style={styles.headerSubtitle}>Showing {sorted.length} of {stations.length} stations</Text>
          </View>
        </View>

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
          {showFiltersOpen && (
            <View style={styles.dropdownAbsolute}>
              <View style={{paddingVertical:8}}>
                <Text style={styles.dropdownText}>Plugs</Text>
              </View>
              <View style={styles.filterRowInline}>
                {distinctPlugTypes.map(pt => (
                  <TouchableOpacity key={pt} style={[styles.filterChip, plugFilter===pt && styles.filterChipActive]} onPress={() => setPlugFilter(plugFilter===pt? null : pt)}>
                    <Text style={[styles.filterChipText, plugFilter===pt && styles.filterChipTextActive]}>{pt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowRangeOpen(r => !r)}>
            <Text style={styles.controlBtnText}>Range: {rangeKm}km</Text>
          </TouchableOpacity>
          {showRangeOpen && (
            <View style={styles.dropdownAbsolute}>
              <View style={styles.rangeScale}>
                {rangeSteps.map(s => (
                  <TouchableOpacity
                    key={`range-${s}`}
                    onPress={() => { setRangeKm(s); setShowRangeOpen(false); }}
                    style={[styles.rangeStep, s <= rangeKm && styles.rangeStepActive]}
                  >
                    <Text style={[styles.rangeStepText, s <= rangeKm && styles.rangeStepTextActive]}>{s}km</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* dropdowns are now anchored to their buttons (see dropdownWrapper + dropdownAbsolute styles) */}

      <FlatList
        data={sorted}
        renderItem={renderStation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{padding:20, color:'#c6cbd3'}}>No stations match filters.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A10',
  },
  listContent: {
    padding: 15,
  },
  stationCard: {
    backgroundColor: '#0b1220',
    borderRadius: 8,
    padding: 12,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  controlBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  headerRow: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#08121a',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#C6CFD7',
    fontSize: 12,
    marginTop: 2,
  },
  headerBackBtn: {
    paddingRight: 10,
    paddingVertical: 6,
  },
  dropdownWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  dropdownAbsolute: {
    position: 'absolute',
    top: 44,
    left: 0,
    backgroundColor: '#07111a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 0,
    elevation: 6,
    zIndex: 999,
    minWidth: '100%',
    maxWidth: 220,
  },
  rangeScale: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  rangeStep: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#0f232b',
    marginRight: 8,
  },
  rangeStepActive: {
    backgroundColor: '#1b7f5a',
  },
  rangeStepText: {
    color: '#c6cbd3',
    fontSize: 12,
  },
  rangeStepTextActive: {
    color: '#02110A',
    fontWeight: '700',
  },
  filterRowInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rangeWrapper: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rangeLabel: {
    color: '#C6CFD7',
    fontSize: 12,
    marginBottom: 6,
  },
  rangeBtn: {
    backgroundColor: '#1b2733',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  rangeBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  dropdown: {
    backgroundColor: '#07111a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  dropdownText: {
    color: '#c6cbd3',
    fontSize: 14,
  },
  filterDropdown: {
    backgroundColor: '#07111a',
    marginHorizontal: 15,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  filterTitle: {
    color: '#c6cbd3',
    fontWeight: '700',
    marginBottom: 8,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stationDistance: {
    fontSize: 14,
    color: '#C6CFD7',
  },
  stationMeta: {
    fontSize: 12,
    color: '#9fb0bf',
    marginTop: 4,
    maxWidth: 220,
    flexShrink: 1,
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
    color: '#C6CFD7',
  },
  rating: {
    fontSize: 12,
    color: '#C6CFD7',
    marginTop: 4,
    fontWeight: '600',
  },
});
