import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ScanQR'>;

/**
 * ScanQRScreen simulates QR code scanning to initiate charging.
 * In production, this would use the device camera to scan the charger's QR code.
 * After successful scan, navigates to the rating screen.
 */
export default function ScanQRScreen({ navigation, route }: Props) {
  const { reservationId } = route.params;

  const handleSimulateScan = () => {
    setTimeout(() => {
      navigation.navigate('Rating', {
        stationId: 'station-123',
        reservationId,
      });
    }, 1500);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.scanArea}>
        <View style={styles.scanFrame}>
          <Text style={styles.scanText}>Position QR code within frame</Text>
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.instruction}>
          Point your camera at the QR code on the charging station to start your session
        </Text>

        <TouchableOpacity style={styles.simulateButton} onPress={handleSimulateScan}>
          <Text style={styles.simulateButtonText}>Simulate Scan (MVP)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  instructionContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  simulateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 15,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});
