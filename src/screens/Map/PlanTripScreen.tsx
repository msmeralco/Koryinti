import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { useState, useEffect } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { searchPlaces, formatDisplayName, GeocodingResult } from '@/services/geocodingService';

type Props = NativeStackScreenProps<MapStackParamList, 'PlanTrip'>;

/**
 * PlanTripScreen allows users to input their origin and destination
 * to get a suggested route with charging stations along the way.
 */

export default function PlanTripScreen({ navigation }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<GeocodingResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<GeocodingResult[]>([]);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);

  // Default map region (Central Manila, Metro Manila, Philippines)
  const [region] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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
      navigation.navigate('TripRoute', { from, to });
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
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Example marker - Central Manila */}
        <Marker
          coordinate={{
            latitude: 14.5995,
            longitude: 120.9842,
          }}
          title="Central Manila"
          description="Metro Manila, Philippines"
        />
      </MapView>

      <View style={styles.inputContainer}>
        <Text style={styles.title}>Plan Your Trip</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>From</Text>
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
          <Text style={styles.inputLabel}>To</Text>
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

        <TouchableOpacity
          style={[styles.button, (!from || !to) && styles.buttonDisabled]}
          onPress={handlePlanRoute}
          disabled={!from || !to}
        >
          <Text style={styles.buttonText}>Find Route</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
});
