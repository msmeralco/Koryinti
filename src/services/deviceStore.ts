import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple device-scoped storage. Uses a generated device id saved in AsyncStorage so
// the same physical device gets the same stored data. This is local-only (no backend).

const DEVICE_ID_KEY = 'deviceId';

async function generateId() {
  // Simple random id; fine for local device identification
  return `dev-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export async function getDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = await generateId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch (err) {
    // Fallback: return a non-persistent id (shouldn't normally happen)
    return `dev-fallback-${Date.now()}`;
  }
}

export async function getDeviceKey(suffix: string) {
  const id = await getDeviceId();
  return `device:${id}:${suffix}`;
}

export async function saveForDevice<T>(suffix: string, value: T): Promise<void> {
  const key = await getDeviceKey(suffix);
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadForDevice<T>(suffix: string): Promise<T | null> {
  const key = await getDeviceKey(suffix);
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

// For compatibility with existing code that expects a global 'vehicleData' key,
// also write/read a non-device-scoped key when saving vehicle data.
export async function saveVehicleData(deviceScoped: any): Promise<void> {
  await saveForDevice('vehicleData', deviceScoped);
  try {
    await AsyncStorage.setItem('vehicleData', JSON.stringify(deviceScoped));
  } catch (e) {
    // ignore
  }
}

export async function loadVehicleData(): Promise<any | null> {
  const dev = await loadForDevice<any>('vehicleData');
  if (dev) return dev;
  try {
    const raw = await AsyncStorage.getItem('vehicleData');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function saveReservationsForDevice<T>(reservations: T): Promise<void> {
  await saveForDevice('reservations', reservations);
}

export async function loadReservationsForDevice<T>(): Promise<T | null> {
  return await loadForDevice<T>('reservations');
}
