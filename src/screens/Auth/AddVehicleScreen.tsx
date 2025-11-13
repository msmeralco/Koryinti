import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useState } from 'react';

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

  const handleContinue = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Your Vehicle</Text>
        <Text style={styles.subtitle}>Tell us about your electric vehicle</Text>

        <TextInput
          style={styles.input}
          placeholder="Make (e.g., Tesla)"
          value={make}
          onChangeText={setMake}
        />
        <TextInput
          style={styles.input}
          placeholder="Model (e.g., Model 3)"
          value={model}
          onChangeText={setModel}
        />
        <TextInput
          style={styles.input}
          placeholder="Year (e.g., 2023)"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleContinue}>
          <Text style={styles.skipText}>Skip for now</Text>
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
