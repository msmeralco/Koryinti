export type RootStackParamList = {
  Registration: undefined;
  AddVehicle: undefined;
  AddPayment: undefined;
  Notifications: undefined;
  Privacy: undefined;
  HelpSupport: undefined;
  MainTabs: undefined;
  AdminDashboard: undefined;
};

export type MainTabsParamList = {
  Map: undefined;
  Profile: undefined;
  Reservations: undefined;
  Data: undefined;
};

export type MapStackParamList = {
  MapHome: undefined;
  NearbyStations: { stations: EnrichedStation[] };
  StationProfile: { station: EnrichedStation };
  ReserveStation: { stationId: string };
  ConfirmPayment: { stationId: string; reservationDetails: ReservationDetails };
  PlanTrip: undefined;
  TripRoute: {
    from: string;
    to: string;
    currentBatteryPercent?: number;
    minimumArrivalBattery?: number;
  };
  ReservationDetails: { routeId: string; stations: EnrichedStation[] };
  ScanQR: { reservationId: string };
  Rating: { stationId: string; reservationId: string };
};

export interface EnrichedStation {
  id: string; // OpenChargeMap ID (stringified)
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  totalPlugs: number;
  plugsInUse: number;
  availablePlugs: number;
  plugTypes: string[];
  powerKW: number; // aggregate or max power in kW
  distanceKm: number;
  driveMinutes: number;
  rating: number; // synthetic rating 1-5
  pricePerKWh: number; // synthetic price
  amenities: {
    wifi: boolean;
    bathroom: boolean;
    pwdFriendly: boolean;
    waitingLounge: boolean;
  };
  state: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  availableChargers: number;
  totalChargers: number;
  chargingSpeed: string;
  pricePerKwh: number;
  amenities: string[];
  rating: number;
  powerKW?: number; // Charging power in kW
}

export interface ReservationDetails {
  stationId: string;
  date: string;
  time: string;
  duration: number;
  estimatedCost: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
  licensePlate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  vehicles: Vehicle[];
}

export interface Route {
  id: string;
  from: string;
  to: string;
  distance: number;
  estimatedTime: number;
  suggestedStations: Station[];
}
