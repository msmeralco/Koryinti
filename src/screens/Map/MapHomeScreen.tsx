import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MapStackParamList, 'MapHome'>;

const EVCarIcon = require('../../../assets/evcaricon.png');

export default function MapHomeScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      {/* Top “map” area (just dark for now) */}
      <View style={styles.mapArea} />

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        {/* Greeting + info + car */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingText}>Welcome back!</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>9:30 A.M.</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>28°C</Text>
              <Ionicons
                name="sunny-outline"
                size={16}
                color="#C6CFD7"
                style={{ marginLeft: 6 }}
              />
            </View>

            <View style={styles.batteryPill}>
              <Ionicons name="flash" size={16} color="#FF5252" />
              <Text style={styles.batteryText}>24%</Text>
            </View>
          </View>

          <Image source={EVCarIcon} style={styles.carImage} resizeMode="contain" />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('NearbyStations')}
          >
            <MaterialCommunityIcons
              name="flash-outline"
              size={22}
              color="#02110A"
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Find Nearby Station</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('PlanTrip')}
          >
            <Ionicons
              name="car-sport-outline"
              size={22}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.secondaryButtonText}>Plan a Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // FULL-SCREEN DARK BACKGROUND
  screen: {
    flex: 1,
    backgroundColor: '#050A10', // fill whole screen
  },

  // TOP “MAP” AREA
  mapArea: {
    flex: 1.3,
    backgroundColor: '#050A10',
  },

  // BOTTOM CONTENT AREA
  bottomContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
  },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#C6CFD7',
    fontSize: 15,
    marginBottom: 2,
  },
  batteryPill: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#261013',
  },
  batteryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5252',
  },

  carImage: {
    width: 190,
    height: 100,
  },

  buttonContainer: {
    marginTop: 4,
    gap: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#46F98C',
    paddingVertical: 16,
    borderRadius: 20,
  },
  primaryButtonText: {
    color: '#02110A',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171C24',
    paddingVertical: 16,
    borderRadius: 20,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
