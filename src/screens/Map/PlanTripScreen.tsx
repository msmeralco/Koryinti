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
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import mapDarkStyle from './mapDarkStyle.json';
import { searchPlaces, formatDisplayName, GeocodingResult } from '@/services/geocodingService';
import * as Location from 'expo-location';
import { getNearbyChargingStations } from '@/services/routeService';
import { Station } from '@/types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BackArrow from '@/components/BackArrow';
import { calculateDetailedRoute } from '@/services/routeCalculationEngine';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);

  // Departure time selection
  const [departureTime, setDepartureTime] = useState<'now' | 'custom'>('now');
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  // Charging strategy: 0 = Few long stops, 1 = Balanced, 2 = Many short stops
  const [chargingStrategy, setChargingStrategy] = useState<number>(1);

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
        setStationsLoading(true);
        const stations = await getNearbyChargingStations(region.latitude, region.longitude, 20);
        setNearbyStations(stations);
      } catch (error) {
        console.error('Error loading nearby stations:', error);
      } finally {
        setStationsLoading(false);
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

  // Handle datetime picker change
  const onDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDateTimePicker(false);
    }
    if (selectedDate) {
      setSelectedDateTime(selectedDate);
      if (Platform.OS === 'ios') {
        // iOS uses inline picker, keep it open
      }
    }
  };

  // Get traffic prediction based on departure time
  const getTrafficMultiplier = (date: Date): number => {
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Weekend traffic (lighter)
    if (day === 0 || day === 6) {
      if (hour >= 10 && hour <= 20) return 1.1; // Moderate
      return 1.0; // Light
    }

    // Weekday traffic patterns
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 1.3; // Heavy rush hour
    } else if ((hour >= 10 && hour <= 16) || (hour >= 20 && hour <= 22)) {
      return 1.15; // Moderate
    }
    return 1.0; // Light traffic (late night/early morning)
  };

  // Format departure time display
  const formatDepartureTime = (): string => {
    if (departureTime === 'now') return 'Leave now';
    const now = new Date();
    const timeDiff = selectedDateTime.getTime() - now.getTime();
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (timeDiff < 0) return 'Leave now (time passed)';
    if (hoursDiff === 0 && minutesDiff < 30) return 'Leave soon';

    const timeStr = selectedDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = selectedDateTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return `${dateStr} at ${timeStr}`;
  };

  const handlePlanRoute = async () => {
    if (from && to) {
      Keyboard.dismiss();

      try {
        // Pre-validate the route to check if it's possible (silently)
        const trafficMultiplier =
          departureTime === 'custom' ? getTrafficMultiplier(selectedDateTime) : 1.0;

        const result = await calculateDetailedRoute({
          from,
          to,
          currentBatteryPercent: batteryPercent,
          minimumArrivalBattery: minArrivalBattery,
          chargingStrategy,
          trafficMultiplier,
        });

        // Check if route calculation failed
        if (!result.success || !result.route) {
          Alert.alert(
            '❌ Route Calculation Failed',
            result.error || 'Unable to calculate route. Please try again.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }

        const detailedRoute = result.route;

        // Check if the trip is impossible
        // Impossible conditions:
        // 1. Final battery at destination is 0% or negative
        // 2. Any segment has batteryAtArrival <= 0 (would run out mid-trip)

        if (detailedRoute.finalBattery <= 0) {
          Alert.alert(
            '⚠️ Impossible Trip',
            `This trip cannot be completed with your current battery (${batteryPercent}%).\n\n` +
              `Even with available charging stations, your battery would reach 0% at the destination.\n\n` +
              `💡 Suggestions:\n` +
              `• Start with a higher battery percentage\n` +
              `• Choose a closer destination\n` +
              `• Lower your minimum arrival battery requirement (currently ${minArrivalBattery}%)`,
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }

        // Check if battery would run out during any segment
        let wouldRunOut = false;
        let criticalSegment = null;
        for (const segment of detailedRoute.segments) {
          if (segment.batteryAtArrival <= 0) {
            wouldRunOut = true;
            criticalSegment = segment;
            break;
          }
        }

        if (wouldRunOut) {
          const segmentInfo = criticalSegment
            ? `\n\nYour battery would be depleted before reaching: ${criticalSegment.location}`
            : '';

          Alert.alert(
            '⚠️ Impossible Trip',
            `Your EV would run out of battery during this trip.${segmentInfo}\n\n` +
              `The distance is too far and there are insufficient charging stations along the route.\n\n` +
              `💡 Suggestions:\n` +
              `• Start with a higher battery percentage (currently ${batteryPercent}%)\n` +
              `• Plan a shorter trip\n` +
              `• Lower your minimum arrival battery requirement (currently ${minArrivalBattery}%)`,
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }

        // Trip is possible - navigate to TripRouteScreen
        navigation.navigate('TripRoute', {
          from,
          to,
          currentBatteryPercent: batteryPercent,
          minimumArrivalBattery: minArrivalBattery,
          chargingStrategy,
          departureTime: departureTime === 'custom' ? selectedDateTime.toISOString() : undefined,
        });
      } catch (error: any) {
        console.error('Error validating route:', error);
        Alert.alert(
          '❌ Route Calculation Failed',
          error.message ||
            'Unable to calculate route. Please check your internet connection and try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <MapView
          style={styles.map}
          initialRegion={region}
          region={region}
          provider={PROVIDER_GOOGLE}
          googleMapId="508c49184e5a4073b3a02f38"
          customMapStyle={mapDarkStyle as any}
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
          <View style={[styles.inputContainer, isFormCollapsed && styles.inputContainerCollapsed]}>
            {/* Handle bar to match bottom sheet styling */}
            <View style={styles.handleBar} />

            {/* Controls row: Back arrow + Show/Hide Trip Details toggle */}
            <View style={styles.planControls}>
              <BackArrow onPress={() => navigation.goBack()} />

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsFormCollapsed(!isFormCollapsed)}
              >
                <Text style={styles.toggleButtonText}>
                  {isFormCollapsed ? '▲ Show Trip Details' : '▼ Hide to View Map'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading overlay when fetching stations */}
            {stationsLoading && (
              <View style={styles.mapLoadingOverlay} pointerEvents="none">
                <View style={styles.mapLoadingCard}>
                  <ActivityIndicator size="large" color="#00F470" />
                  <Text style={styles.mapLoadingText}>Loading nearby stations…</Text>
                </View>
              </View>
            )}

            {!isFormCollapsed && (
              <>
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
                    placeholderTextColor="#9CA3AF"
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
                    <Text style={styles.batteryHint}>
                      We&apos;ll suggest charging stops if needed
                    </Text>
                  </View>
                </View>

                {/* Departure Time Selection */}
                <View style={styles.departureSection}>
                  <View style={styles.departureButtons}>
                    <TouchableOpacity
                      style={[
                        styles.departureButton,
                        departureTime === 'now' && styles.departureButtonActive,
                      ]}
                      onPress={() => {
                        setDepartureTime('now');
                        setSelectedDateTime(new Date());
                      }}
                    >
                      <Ionicons
                        name="navigate"
                        size={18}
                        color={departureTime === 'now' ? '#000000' : '#00F470'}
                      />
                      <Text
                        style={[
                          styles.departureButtonText,
                          departureTime === 'now' && styles.departureButtonTextActive,
                        ]}
                      >
                        Leave now
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.departureButton,
                        departureTime === 'custom' && styles.departureButtonActive,
                      ]}
                      onPress={() => {
                        setDepartureTime('custom');
                        setShowDateTimePicker(true);
                      }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={departureTime === 'custom' ? '#000000' : '#00F470'}
                      />
                      <Text
                        style={[
                          styles.departureButtonText,
                          departureTime === 'custom' && styles.departureButtonTextActive,
                        ]}
                      >
                        {departureTime === 'custom' ? formatDepartureTime() : 'Schedule'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Traffic prediction hint */}
                  {departureTime === 'custom' && (
                    <Text style={styles.trafficHint}>
                      {(() => {
                        const multiplier = getTrafficMultiplier(selectedDateTime);
                        if (multiplier >= 1.25) return '🔴 Heavy traffic expected';
                        if (multiplier >= 1.1) return '🟡 Moderate traffic';
                        return '🟢 Light traffic';
                      })()}
                    </Text>
                  )}
                </View>

                {/* Charging Strategy Selector - ABRP Style */}
                <View style={styles.strategySection}>
                  <View style={styles.strategyHeader}>
                    <Ionicons name="battery-charging" size={16} color="#9CA3AF" />
                    <Text style={styles.strategyLabel}>Charging stops</Text>
                  </View>

                  <View style={styles.strategySliderContainer}>
                    <View style={styles.strategyOptions}>
                      <TouchableOpacity
                        style={[
                          styles.strategyOption,
                          chargingStrategy === 0 && styles.strategyOptionActive,
                        ]}
                        onPress={() => setChargingStrategy(0)}
                      >
                        <Text
                          style={[
                            styles.strategyOptionText,
                            chargingStrategy === 0 && styles.strategyOptionTextActive,
                          ]}
                        >
                          Few but long
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.strategyOption,
                          chargingStrategy === 1 && styles.strategyOptionActive,
                        ]}
                        onPress={() => setChargingStrategy(1)}
                      >
                        <Text
                          style={[
                            styles.strategyOptionText,
                            chargingStrategy === 1 && styles.strategyOptionTextActive,
                          ]}
                        >
                          Balanced
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.strategyOption,
                          chargingStrategy === 2 && styles.strategyOptionActive,
                        ]}
                        onPress={() => setChargingStrategy(2)}
                      >
                        <Text
                          style={[
                            styles.strategyOptionText,
                            chargingStrategy === 2 && styles.strategyOptionTextActive,
                          ]}
                        >
                          Many but short
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.strategyHint}>
                    {chargingStrategy === 0 && '⚡ Fewer stops, charge to 80-90% (longer charging)'}
                    {chargingStrategy === 1 && '⚖️ Balanced approach for time and convenience'}
                    {chargingStrategy === 2 && '🚀 Quick stops, charge to 50-60% (fastest trip)'}
                  </Text>
                </View>

                {/* DateTime Picker - Compact for both platforms */}
                {showDateTimePicker && (
                  <DateTimePicker
                    value={selectedDateTime}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={onDateTimeChange}
                    minimumDate={new Date()}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                  />
                )}

                <TouchableOpacity
                  style={[styles.button, (!from || !to) && styles.buttonDisabled]}
                  onPress={handlePlanRoute}
                  disabled={!from || !to}
                >
                  <Ionicons
                    name="flash-outline"
                    size={18}
                    color="#000000"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.buttonText}>Find route with chargers</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    backgroundColor: '#EAC67A',
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
  planControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  inputContainerCollapsed: {
    padding: 10,
    paddingBottom: 20,
  },
  toggleButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,244,112,0.08)',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.3)',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00F470',
  },

  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  mapLoadingCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(5,8,22,0.85)',
    alignItems: 'center',
  },
  mapLoadingText: {
    color: '#E5E7EB',
    marginTop: 8,
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
  // Departure time styles
  departureSection: {
    marginBottom: 18,
    marginTop: 4,
  },
  departureButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  departureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: '#00F470',
  },
  departureButtonActive: {
    backgroundColor: '#00F470',
    borderColor: '#00F470',
  },
  departureButtonText: {
    fontSize: 14,
    color: '#00F470',
    fontWeight: '600',
  },
  departureButtonTextActive: {
    color: '#000000',
  },
  trafficHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  // Charging strategy styles
  strategySection: {
    marginBottom: 18,
    marginTop: 4,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  strategyLabel: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  strategySliderContainer: {
    marginBottom: 8,
  },
  strategyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  strategyOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0B1020',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    alignItems: 'center',
  },
  strategyOptionActive: {
    backgroundColor: 'rgba(0,244,112,0.15)',
    borderColor: '#00F470',
  },
  strategyOptionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  strategyOptionTextActive: {
    color: '#00F470',
  },
  strategyHint: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
  },
  datePickerContainer: {
    backgroundColor: '#0B1020',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.3)',
  },
  datePickerDone: {
    backgroundColor: '#00F470',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginTop: 12,
    alignItems: 'center',
  },
  datePickerDoneText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});
