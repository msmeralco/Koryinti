import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { searchPlaces, formatDisplayName, GeocodingResult } from '@/services/geocodingService';
import * as Location from 'expo-location';
import { getNearbyChargingStations } from '@/services/routeService';
import { Station } from '@/types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MapStackParamList, 'PlanTrip'>;

/**
 * PlanTripScreen allows users to input their origin and destination
 * to get a suggested route with charging stations along the way.
 */

export default function PlanTripScreen({ navigation }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [batteryPercent, setBatteryPercent] = useState(80); // Default 80%
  const [minArrivalBattery, setMinArrivalBattery] = useState(25); // Minimum battery at destination
  const [fromSuggestions, setFromSuggestions] = useState<GeocodingResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<GeocodingResult[]>([]);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);

  // Map region - will update to user's location
  const [region, setRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Load nearby charging stations when component mounts or region changes
  useEffect(() => {
    const loadStations = async () => {
      try {
        const stations = await getNearbyChargingStations(region.latitude, region.longitude, 20);
        setNearbyStations(stations);
      } catch (error) {
        console.error('Error loading nearby stations:', error);
      }
    };
    loadStations();
  }, [region.latitude, region.longitude]);

  // Get user's current location
  const getCurrentLocation = async (field: 'from' | 'to') => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use current location');
        setGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update map region to user's location
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Use reverse geocoding to get address name
      const address = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

      if (field === 'from') {
        setFrom(address);
        setFromSuggestions([]);
      } else {
        setTo(address);
        setToSuggestions([]);
      }
      setActiveField(null);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setGettingLocation(false);
    }
  };

  // Debounced search for "From" field
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (from.length >= 3 && activeField === 'from') {
        setSearchingFrom(true);
        const results = await searchPlaces(from);
        setFromSuggestions(results);
        setSearchingFrom(false);
      } else {
        setFromSuggestions([]);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [from, activeField]);

  // Debounced search for "To" field
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (to.length >= 3 && activeField === 'to') {
        setSearchingTo(true);
        const results = await searchPlaces(to);
        setToSuggestions(results);
        setSearchingTo(false);
      } else {
        setToSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [to, activeField]);

  const handlePlanRoute = () => {
    if (from && to) {
      Keyboard.dismiss();
      navigation.navigate('TripRoute', {
        from,
        to,
        currentBatteryPercent: batteryPercent,
        minimumArrivalBattery: minArrivalBattery,
      });
    }
  };

  const selectFromSuggestion = (result: GeocodingResult) => {
    setFrom(formatDisplayName(result.display_name));
    setFromSuggestions([]);
    setActiveField(null);
  };

  const selectToSuggestion = (result: GeocodingResult) => {
    setTo(formatDisplayName(result.display_name));
    setToSuggestions([]);
    setActiveField(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={region}
          region={region}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Show nearby EV charging stations */}
          {nearbyStations.map(station => (
            <Marker
              key={station.id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              title={station.name}
              description={`${station.chargingSpeed} • ${station.availableChargers}/${station.totalChargers} available`}
              pinColor="#00F470"
            />
          ))}
        </MapView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <View style={styles.inputContainer}>
            {/* Handle bar to match bottom sheet styling */}
            <View style={styles.handleBar} />

            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Plan your EV trip</Text>
                <Text style={styles.subtitle}>
                  Set your route and find chargers along the way.
                </Text>
              </View>
              <View style={styles.titleIconWrapper}>
                <Ionicons name="trail-sign-outline" size={24} color="#00F470" />
              </View>
            </View>

            {/* FROM */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <View style={styles.labelLeft}>
                  <Ionicons name="navigate-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.inputLabel}>From</Text>
                </View>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => getCurrentLocation('from')}
                  disabled={gettingLocation}
                >
                  <Ionicons name="locate-outline" size={14} color="#00F470" />
                  <Text style={styles.locationButtonText}>
                    {gettingLocation ? 'Getting...' : 'Use current'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search: SM Mall of Asia, Makati, etc."
                placeholderTextColor="#6B7280"
                value={from}
                onChangeText={text => {
                  setFrom(text);
                  setActiveField('from');
                }}
                onFocus={() => setActiveField('from')}
              />
              {searchingFrom && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#00F470" />
                </View>
              )}
              {fromSuggestions.length > 0 && activeField === 'from' && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={fromSuggestions}
                    keyExtractor={item => item.place_id.toString()}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => selectFromSuggestion(item)}
                      >
                        <Text style={styles.suggestionText}>
                          <Text>📍 </Text>
                          {formatDisplayName(item.display_name)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>

            {/* TO */}
            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <View style={styles.labelLeft}>
                  <Ionicons name="flag-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.inputLabel}>To</Text>
                </View>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => getCurrentLocation('to')}
                  disabled={gettingLocation}
                >
                  <Ionicons name="locate-outline" size={14} color="#00F470" />
                  <Text style={styles.locationButtonText}>
                    {gettingLocation ? 'Getting...' : 'Use current'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search destination..."
                placeholderTextColor="#6B7280"
                value={to}
                onChangeText={text => {
                  setTo(text);
                  setActiveField('to');
                }}
                onFocus={() => setActiveField('to')}
              />
              {searchingTo && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#00F470" />
                </View>
              )}
              {toSuggestions.length > 0 && activeField === 'to' && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={toSuggestions}
                    keyExtractor={item => item.place_id.toString()}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => selectToSuggestion(item)}
                      >
                        <Text style={styles.suggestionText}>
                          <Text>📍 </Text>
                          {formatDisplayName(item.display_name)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>

            {/* Battery Level Input */}
            <View style={styles.batteryRow}>
              <View style={styles.batteryContainer}>
                <View style={styles.batteryLabelRow}>
                  <MaterialCommunityIcons
                    name="battery-medium"
                    size={16}
                    color="#9CA3AF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.batteryLabel}>Current battery (%)</Text>
                </View>
                <TextInput
                  style={styles.batteryInput}
                  placeholder="0–100"
                  placeholderTextColor="#6B7280"
                  value={batteryPercent.toString()}
                  onChangeText={text => {
                    const num = parseInt(text, 10) || 0;
                    setBatteryPercent(Math.min(Math.max(num, 0), 100));
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.batteryHint}>Your estimated battery right now</Text>
              </View>

              {/* Minimum Arrival Battery Input */}
              <View style={styles.batteryContainer}>
                <View style={styles.batteryLabelRow}>
                  <MaterialCommunityIcons
                    name="battery-charging-medium"
                    size={16}
                    color="#9CA3AF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.batteryLabel}>Min. arrival (%)</Text>
                </View>
                <TextInput
                  style={styles.batteryInput}
                  placeholder="0–100"
                  placeholderTextColor="#6B7280"
                  value={minArrivalBattery.toString()}
                  onChangeText={text => {
                    const num = parseInt(text, 10) || 0;
                    setMinArrivalBattery(Math.min(Math.max(num, 0), 100));
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={styles.batteryHint}>We&apos;ll suggest charging stops if needed</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, (!from || !to) && styles.buttonDisabled]}
              onPress={handlePlanRoute}
              disabled={!from || !to}
            >
              <Ionicons name="flash-outline" size={18} color="#000000" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>Find route with chargers</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#050816',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 18,
  },
  handleBar: {
    alignSelf: 'center',
    width: 50,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#1F2933',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  titleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,244,112,0.06)',
  },
  inputWrapper: {
    marginBottom: 14,
    position: 'relative',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,244,112,0.08)',
  },
  locationButtonText: {
    fontSize: 11,
    color: '#00F470',
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#0B1020',
    color: '#F9FAFB',
  },
  loadingContainer: {
    position: 'absolute',
    right: 16,
    top: 42,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: '#050816',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
    maxHeight: 220,
    zIndex: 1000,
  },
  suggestionsList: {
    borderRadius: 14,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,41,55,0.7)',
  },
  suggestionText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  batteryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  batteryContainer: {
    flex: 1,
  },
  batteryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  batteryLabel: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  batteryInput: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#0B1020',
    color: '#F9FAFB',
    marginBottom: 4,
    textAlign: 'center',
  },
  batteryHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F470',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 10,
    alignSelf: 'center',
    minWidth: '80%',
  },
  buttonDisabled: {
    backgroundColor: '#1F2933',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
