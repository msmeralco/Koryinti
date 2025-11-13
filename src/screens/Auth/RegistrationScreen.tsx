import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

/**
 * RegistrationScreen serves as the entry point for new users.
 * For MVP, this is a simple screen without full authentication.
 * Users can proceed directly to add their vehicle.
 */
export default function RegistrationScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    navigation.navigate('AddVehicle');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Revolt</Text>
        <Text style={styles.subtitle}>Find and reserve EV charging stations with ease</Text>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
