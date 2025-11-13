import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';

import MapHomeScreen from '@/screens/Map/MapHomeScreen';
import NearbyStationsScreen from '@/screens/Map/NearbyStationsScreen';
import StationProfileScreen from '@/screens/Map/StationProfileScreen';
import ReserveStationScreen from '@/screens/Map/ReserveStationScreen';
import ConfirmPaymentScreen from '@/screens/Map/ConfirmPaymentScreen';
import PlanTripScreen from '@/screens/Map/PlanTripScreen';
import TripRouteScreen from '@/screens/Map/TripRouteScreen';
import ReservationDetailsScreen from '@/screens/Map/ReservationDetailsScreen';
import ScanQRScreen from '@/screens/Map/ScanQRScreen';
import RatingScreen from '@/screens/Map/RatingScreen';

const Stack = createNativeStackNavigator<MapStackParamList>();

/**
 * MapNavigator handles all map-related screens including:
 * - Viewing nearby charging stations
 * - Planning trips and routes
 * - Making reservations
 * - Scanning QR codes for charging
 * - Rating stations after use
 */

export default function MapNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="MapHome"
        component={MapHomeScreen}
        options={{ title: 'Find Charging Stations' }}
      />
      <Stack.Screen
        name="NearbyStations"
        component={NearbyStationsScreen}
        options={{ title: 'Nearby Stations' }}
      />
      <Stack.Screen
        name="StationProfile"
        component={StationProfileScreen}
        options={{ title: 'Station Details' }}
      />
      <Stack.Screen
        name="ReserveStation"
        component={ReserveStationScreen}
        options={{ title: 'Reserve Charger' }}
      />
      <Stack.Screen
        name="ConfirmPayment"
        component={ConfirmPaymentScreen}
        options={{ title: 'Confirm & Pay' }}
      />
      <Stack.Screen name="PlanTrip" component={PlanTripScreen} options={{ title: 'Plan a Trip' }} />
      <Stack.Screen
        name="TripRoute"
        component={TripRouteScreen}
        options={{ title: 'Suggested Route' }}
      />
      <Stack.Screen
        name="ReservationDetails"
        component={ReservationDetailsScreen}
        options={{ title: 'Your Reservation' }}
      />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan QR Code' }} />
      <Stack.Screen
        name="Rating"
        component={RatingScreen}
        options={{ title: 'Rate Your Experience' }}
      />
    </Stack.Navigator>
  );
}
