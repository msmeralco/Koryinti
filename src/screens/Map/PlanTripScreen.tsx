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

type Props = NativeStackScreenProps<MapStackParamList, 'PlanTrip'>;

/**
 * PlanTripScreen allows users to input their origin and destination
 * to get a suggested route with charging stations along the way.
 */

export default function PlanTripScreen({ navigation }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [batteryPercent, setBatteryPercent] = useState(80); // Default 80%
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
      navigation.navigate('TripRoute', { from, to, currentBatteryPercent: batteryPercent });
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
              pinColor="#4CAF50"
            />
          ))}
        </MapView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.title}>Plan Your Trip</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>From</Text>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => getCurrentLocation('from')}
                  disabled={gettingLocation}
                >
                  <Text style={styles.locationButtonText}>
                    {gettingLocation ? '📍 Getting...' : '📍 Current Location'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search: SM Mall of Asia, Makati, etc."
                value={from}
                onChangeText={text => {
                  setFrom(text);
                  setActiveField('from');
                }}
                onFocus={() => setActiveField('from')}
              />
              {searchingFrom && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4CAF50" />
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
                          📍 {formatDisplayName(item.display_name)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>To</Text>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => getCurrentLocation('to')}
                  disabled={gettingLocation}
                >
                  <Text style={styles.locationButtonText}>
                    {gettingLocation ? '📍 Getting...' : '📍 Current Location'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search destination..."
                value={to}
                onChangeText={text => {
                  setTo(text);
                  setActiveField('to');
                }}
                onFocus={() => setActiveField('to')}
              />
              {searchingTo && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4CAF50" />
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
                          📍 {formatDisplayName(item.display_name)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>

            {/* Battery Level Input */}
            <View style={styles.batteryContainer}>
              <Text style={styles.batteryLabel}>Current Battery Level (%)</Text>
              <TextInput
                style={styles.batteryInput}
                placeholder="Enter battery percentage (0-100)"
                value={batteryPercent.toString()}
                onChangeText={text => {
                  const num = parseInt(text) || 0;
                  setBatteryPercent(Math.min(Math.max(num, 0), 100));
                }}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.batteryHint}>Enter your current battery percentage (0-100%)</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, (!from || !to) && styles.buttonDisabled]}
              onPress={handlePlanRoute}
              disabled={!from || !to}
            >
              <Text style={styles.buttonText}>Find Route</Text>
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
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 15,
    position: 'relative',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  locationButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  loadingContainer: {
    position: 'absolute',
    right: 15,
    top: 40,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1000,
  },
  suggestionsList: {
    borderRadius: 10,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  batteryContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  batteryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 10,
  },
  batteryInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 8,
  },
  batteryHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
