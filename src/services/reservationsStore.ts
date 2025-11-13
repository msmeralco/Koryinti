// Simple in-memory reservations store. In a production app you'd persist via AsyncStorage or backend.
import { loadReservationsForDevice, saveReservationsForDevice } from './deviceStore';

export interface ReservationSession {
  id: string;
  station: string;
  hostName: string;
  vehicle: string;
  date: string; // human-readable date
  timeRange: string; // e.g. "3:00 PM - 4:00 PM"
  minutesLeft: number; // >0 means active
}

// Seed with existing mock sessions (old static list) – latest (active) will be unshifted when added.
let reservations: ReservationSession[] = [
  {
    id: '1',
    station: 'BF Homes, Paranaque City',
    hostName: 'Mark Joseph Ilagan',
    vehicle: 'Tesla Model 3',
    date: 'September 30, 2025',
    timeRange: '3:00 PM - 4:00 PM',
    minutesLeft: 53,
  },
  {
    id: '2',
    station: 'Katipunan, Quezon City',
    hostName: 'Ma. Regina Rosel Galfo',
    vehicle: 'Tesla Model 3',
    date: 'September 23, 2025',
    timeRange: '2:00 PM - 4:00 PM',
    minutesLeft: 0,
  },
  {
    id: '3',
    station: 'Timog Avenue, Quezon City',
    hostName: 'Juan Dela Cruz III',
    vehicle: 'Tesla Model 3',
    date: 'September 13, 2025',
    timeRange: '3:00 PM - 4:00 PM',
    minutesLeft: 0,
  },
  {
    id: '4',
    station: 'BF Homes, Paranaque City',
    hostName: 'Mark Joseph Ilagan',
    vehicle: 'Tesla Model 3',
    date: 'September 3, 2025',
    timeRange: '4:00 PM - 5:00 PM',
    minutesLeft: 0,
  },
];

// Load persisted reservations (if any) on module init. This is async but we keep an in-memory
// copy for quick synchronous reads when needed. Consumers should prefer the async getters.
(async () => {
  try {
    const stored = await loadReservationsForDevice<ReservationSession[]>();
    if (stored && Array.isArray(stored) && stored.length > 0) {
      reservations = stored.concat(reservations);
    }
  } catch (e) {
    // ignore
  }
})();

export async function addActiveReservation(stationTitle: string, durationMinutes = 60) {
  const now = new Date();
  const end = new Date(now.getTime() + durationMinutes * 60_000);
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const dateStr = `${monthName} ${now.getDate()}, ${now.getFullYear()}`;
  const session: ReservationSession = {
    id: String(Date.now()),
    station: stationTitle,
    hostName: 'Mark Ilagan', // Use real test user instead of generic 'You'
    vehicle: 'Tesla Model 3', // Placeholder – choose active vehicle later
    date: dateStr,
    timeRange: `${fmt(now)} - ${fmt(end)}`,
    minutesLeft: durationMinutes,
  };
  // Insert at front so it's treated as active reservation (index 0)
  reservations.unshift(session);
  // persist per-device
  try {
    await saveReservationsForDevice(reservations);
  } catch (e) {
    // non-fatal
  }
  return session;
}

export async function getReservations(): Promise<ReservationSession[]> {
  // Return a copy
  return reservations.slice();
}

// Optional: tick down active reservation minutes (could be driven by an interval elsewhere)
export async function decrementActiveReservationMinute() {
  const active = reservations[0];
  if (active && active.minutesLeft > 0) {
    active.minutesLeft = Math.max(active.minutesLeft - 1, 0);
    try {
      await saveReservationsForDevice(reservations);
    } catch (e) {
      // ignore
    }
  }
}