import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { useState } from 'react';

type Props = NativeStackScreenProps<MapStackParamList, 'PlanTrip'>;

/**
 * PlanTripScreen allows users to input their origin and destination
 * to get a suggested route with charging stations along the way.
 */
export default function PlanTripScreen({ navigation }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handlePlanRoute = () => {
    if (from && to) {
      navigation.navigate('TripRoute', { from, to });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map Background</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.title}>Plan Your Trip</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>From</Text>
          <TextInput
            style={styles.input}
            placeholder="Starting location"
            value={from}
            onChangeText={setFrom}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>To</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination"
            value={to}
            onChangeText={setTo}
          />
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
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 20,
    color: '#4CAF50',
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
