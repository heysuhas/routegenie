export interface TransportOption {
  mode: 'driving' | 'rideshare' | 'public' | 'walking' | 'auto';
  duration: number; // in minutes
  cost: {
    min: number;
    max: number;
  };
  carbonImpact: 'low' | 'medium' | 'high';
  icon: string;
  name: string;
  description: string;
}

export interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export interface RouteRequest {
  origin: Location;
  destination: Location;
}

export interface RouteResponse {
  routes: TransportOption[];
  distance: number; // in km
  timestamp: number;
}

export type SortOption = 'time' | 'cost' | 'environmental';

export interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
  address?: string;
}

// Google Maps API types
declare global {
  interface Window {
    google: typeof google;
  }
}