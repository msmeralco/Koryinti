import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'ScanQR'>;

const ACCENT_GREEN = '#00F470';

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top scan area */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrameOuter}>
            <View style={styles.scanFrame}>
              <Ionicons
                name="qr-code-outline"
                size={40}
                color={ACCENT_GREEN}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.scanText}>Position QR code within the frame</Text>
            </View>

            {/* corner accents */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Bottom sheet */}
        <View style={styles.instructionContainer}>
          <View style={styles.handleBar} />

          <Text style={styles.title}>Scan QR code</Text>
          <Text style={styles.instruction}>
            Point your camera at the QR code on the charging station to start your session.
          </Text>

          <TouchableOpacity style={styles.simulateButton} onPress={handleSimulateScan}>
            <Ionicons
              name="flash-outline"
              size={18}
              color="#050816"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.simulateButtonText}>Simulate scan (MVP)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons
              name="close-outline"
              size={18}
              color="#E5E7EB"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const FRAME_SIZE = 260;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16, // gives breathing room from Dynamic Island
  },
  scanFrameOuter: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: FRAME_SIZE - 30,
    height: FRAME_SIZE - 30,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(148,163,184,0.6)',
    backgroundColor: 'rgba(5, 8, 22, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanText: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: ACCENT_GREEN,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  instructionContainer: {
    backgroundColor: '#050816',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31,41,55,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  instruction: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 20,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingVertical: 14,
    borderRadius: 999,
    marginBottom: 10,
  },
  simulateButtonText: {
    color: '#050816',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  cancelButtonText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
