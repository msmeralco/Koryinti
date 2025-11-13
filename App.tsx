import { StatusBar } from 'expo-status-bar';
import RootNavigator from '@/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * App is the main entry point for the Revolt EV Charging Station app.
 * It sets up the navigation structure and global providers.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
