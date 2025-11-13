import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findVehicleSpecs, getDefaultVehicleSpecs } from '@/services/vehicleDatabase';

type Props = NativeStackScreenProps<RootStackParamList, 'AddVehicle'>;

/**
 * AddVehicleScreen allows users to add their vehicle information.
 * For MVP, this is a simplified form without full validation.
 * Users can proceed to the main app after adding basic vehicle info.
 */

export default function AddVehicleScreen({ navigation }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [batteryPercent, setBatteryPercent] = useState('80');
  const [detectedSpecs, setDetectedSpecs] = useState<string>('');

  const handleContinue = async () => {
    // Find vehicle specs from database
    const specs = findVehicleSpecs(make, model) || getDefaultVehicleSpecs();

    // Save vehicle data to AsyncStorage
    const vehicleData = {
      make: make || 'Unknown',
      model: model || 'Unknown',
      year: year || '2023',
      batteryCapacity: specs.batteryCapacity,
      range: specs.range,
      currentBatteryPercent: parseInt(batteryPercent) || 80,
      chargingSpeed: specs.chargingSpeed,
    };

    await AsyncStorage.setItem('vehicleData', JSON.stringify(vehicleData));
    navigation.navigate('MainTabs');
  };

  // Auto-detect vehicle specs when make/model changes
  const handleMakeChange = (text: string) => {
    setMake(text);
    updateDetectedSpecs(text, model);
  };

  const handleModelChange = (text: string) => {
    setModel(text);
    updateDetectedSpecs(make, text);
  };

  const updateDetectedSpecs = (vehicleMake: string, vehicleModel: string) => {
    if (vehicleMake && vehicleModel) {
      const specs = findVehicleSpecs(vehicleMake, vehicleModel);
      if (specs) {
        setDetectedSpecs(`✓ Found: ${specs.range}km range, ${specs.batteryCapacity}kWh battery`);
      } else {
        setDetectedSpecs('Using default specs (400km range, 60kWh)');
      }
    } else {
      setDetectedSpecs('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Your Vehicle</Text>
        <Text style={styles.subtitle}>Tell us about your electric vehicle</Text>

        <TextInput
          style={styles.input}
          placeholder="Make (e.g., Tesla, BYD, Nissan)"
          value={make}
          onChangeText={handleMakeChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Model (e.g., Model 3, Atto 3, Leaf)"
          value={model}
          onChangeText={handleModelChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Year (e.g., 2023)"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />

        {detectedSpecs !== '' && (
          <View style={styles.specsBox}>
            <Text style={styles.specsText}>{detectedSpecs}</Text>
          </View>
        )}

        <Text style={styles.label}>Current Battery Level</Text>
        <View style={styles.batteryContainer}>
          <TextInput
            style={styles.batteryInput}
            value={batteryPercent}
            onChangeText={setBatteryPercent}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.percentText}>%</Text>
        </View>
        <Text style={styles.helperText}>This helps us suggest optimal charging stops</Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleContinue}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  specsBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  specsText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  batteryInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  percentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 15,
    padding: 10,
  },
  skipText: {
    color: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
  },
});
