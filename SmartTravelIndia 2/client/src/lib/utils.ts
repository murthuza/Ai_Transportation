import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format duration in minutes to a human readable string
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

// Format price in INR
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

// Get color for different transport modes
export function getTransportModeColor(mode: string): string {
  switch (mode.toLowerCase()) {
    case 'train':
      return 'bg-red-600 text-white';
    case 'flight':
      return 'bg-purple-600 text-white';
    case 'bus':
      return 'bg-green-600 text-white';
    case 'car':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

// Get light background color for transport mode icons
export function getTransportModeBgColor(mode: string): string {
  switch (mode.toLowerCase()) {
    case 'train':
      return 'bg-red-100';
    case 'flight':
      return 'bg-purple-100';
    case 'bus':
      return 'bg-green-100';
    case 'car':
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
}

// Get appropriate icon for transportation mode
export function getTransportModeIcon(mode: string): string {
  switch (mode.toLowerCase()) {
    case 'train':
      return 'train';
    case 'flight':
      return 'plane';
    case 'bus':
      return 'bus';
    case 'car':
      return 'car';
    default:
      return 'map-pin';
  }
}

// Calculate straight-line distance between two coordinates in kilometers
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
