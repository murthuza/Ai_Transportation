import { MapPin, Train, Plane, Bus, Car } from "lucide-react";

// City Data
export interface CityData {
  id: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

// Transport Mode
export interface TransportMode {
  id: number;
  name: string;
  icon: typeof MapPin | typeof Train | typeof Plane | typeof Bus | typeof Car;
  color: string;
}

// This file is for reference only. The actual data is served from the backend.
// Use it as a schema reference for frontend components.

// Example Transportation Modes
export const transportModes: TransportMode[] = [
  { id: 1, name: "Train", icon: Train, color: "#DC2626" },
  { id: 2, name: "Flight", icon: Plane, color: "#7C3AED" },
  { id: 3, name: "Bus", icon: Bus, color: "#059669" },
  { id: 4, name: "Car", icon: Car, color: "#2563EB" }
];

// Example Major Cities in India
export const majorCities: CityData[] = [
  { id: 1, name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  { id: 2, name: "Delhi", state: "Delhi", latitude: 28.7041, longitude: 77.1025 },
  { id: 3, name: "Bangalore", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { id: 4, name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
  { id: 5, name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { id: 6, name: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867 },
  { id: 7, name: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },
  { id: 8, name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },
  { id: 9, name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { id: 10, name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462 }
];
