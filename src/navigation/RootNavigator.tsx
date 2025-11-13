import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

import RegistrationScreen from '@/screens/Auth/RegistrationScreen';
import AddVehicleScreen from '@/screens/Auth/AddVehicleScreen';
import MainTabsNavigator from './MainTabsNavigator';
import AdminDashboard from '@/screens/Admin/AdminDashboard';
import PrivacyScreen from '@/screens/Profile/PrivacyScreen';
import HelpSupportScreen from '@/screens/Profile/HelpSupportScreen';
import AddPaymentScreen from '@/screens/Profile/AddPaymentScreen';
import NotificationsScreen from '@/screens/Profile/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator manages the top-level navigation flow including:
 * - Initial registration/authentication
 * - Vehicle setup
 * - Main app navigation via tabs
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
        <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
