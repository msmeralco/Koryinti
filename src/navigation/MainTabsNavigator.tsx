import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabsParamList } from '@/types/navigation';

import MapNavigator from './MapNavigator';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import ReservationsScreen from '@/screens/Reservations/ReservationsScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * MainTabsNavigator provides the primary bottom tab navigation
 * for the main sections of the app after user registration/login
 */

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{
          title: 'Reservations',
          tabBarLabel: 'My Reservations',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
}
