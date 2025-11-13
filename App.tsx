import { StatusBar } from 'expo-status-bar';
import RootNavigator from '@/navigation/RootNavigator';

/**
 * App is the main entry point for the Revolt EV Charging Station app.
 * It sets up the navigation structure and global providers.
 */
export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
