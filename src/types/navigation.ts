export type RootStackParamList = {
  Registration: undefined;
  AddVehicle: undefined;
  MainTabs: undefined;
};

export type MainTabsParamList = {
  Map: undefined;
  Profile: undefined;
  Reservations: undefined;
};

export type MapStackParamList = {
  MapHome: undefined;
  NearbyStations: undefined;
  StationProfile: { stationId: string };
  ReserveStation: { stationId: string };
  ConfirmPayment: { stationId: string; reservationDetails: ReservationDetails };
  PlanTrip: undefined;
  TripRoute: { from: string; to: string };
  ReservationDetails: { routeId: string; stations: string[] };
  ScanQR: { reservationId: string };
  Rating: { stationId: string; reservationId: string };
};

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
