import { googleMapsService } from './googleMapsService';
import { TransportOption, RouteRequest, RouteResponse } from '../types';

interface IndianTransportCosts {
  petrolPerKm: number;
  autoRickshawBase: number;
  autoRickshawPerKm: number;
  busPerKm: number;
  metroPerKm: number;
  uberBaseRate: number;
  uberPerKm: number;
  olaBaseRate: number;
  olaPerKm: number;
}

// Current Indian transportation costs (approximate)
const TRANSPORT_COSTS: IndianTransportCosts = {
  petrolPerKm: 8.5, // ₹8.5 per km for petrol vehicles
  autoRickshawBase: 25, // ₹25 base fare
  autoRickshawPerKm: 12, // ₹12 per km
  busPerKm: 1.5, // ₹1.5 per km for city buses
  metroPerKm: 2.5, // ₹2.5 per km for metro
  uberBaseRate: 50, // ₹50 base fare
  uberPerKm: 15, // ₹15 per km
  olaBaseRate: 45, // ₹45 base fare
  olaPerKm: 14, // ₹14 per km
};

class RouteCalculationService {
  async calculateRoutes(request: RouteRequest): Promise<RouteResponse> {
    try {
      await googleMapsService.initialize();

      const routes: TransportOption[] = [];
      const travelModes = [
        { mode: google.maps.TravelMode.DRIVING, type: 'driving' as const },
        { mode: google.maps.TravelMode.TRANSIT, type: 'public' as const },
        { mode: google.maps.TravelMode.WALKING, type: 'walking' as const },
      ];

      let totalDistance = 0;

      for (const { mode, type } of travelModes) {
        try {
          const result = await googleMapsService.getDirections(
            request.origin.address,
            request.destination.address,
            mode
          );

          if (result.routes && result.routes[0] && result.routes[0].legs[0]) {
            const leg = result.routes[0].legs[0];
            const distanceKm = leg.distance.value / 1000;
            const durationMinutes = Math.ceil(leg.duration.value / 60);
            
            if (totalDistance === 0) {
              totalDistance = distanceKm;
            }

            // Add the route based on travel mode
            if (type === 'driving') {
              // Personal car
              routes.push({
                mode: 'driving',
                name: 'Personal Car',
                description: 'Drive your own vehicle',
                icon: 'Car',
                duration: durationMinutes,
                cost: this.calculateDrivingCost(distanceKm),
                carbonImpact: 'high',
              });

              // Rideshare options (Uber/Ola)
              routes.push({
                mode: 'rideshare',
                name: 'Rideshare (Uber/Ola)',
                description: 'Book a cab through app',
                icon: 'Car',
                duration: Math.ceil(durationMinutes * 1.1), // Slightly longer due to pickup time
                cost: this.calculateRideshareCost(distanceKm),
                carbonImpact: 'medium',
              });

              // Auto-rickshaw (for shorter distances)
              if (distanceKm <= 15) {
                routes.push({
                  mode: 'auto',
                  name: 'Auto Rickshaw',
                  description: 'Three-wheeler taxi',
                  icon: 'Car',
                  duration: Math.ceil(durationMinutes * 1.2),
                  cost: this.calculateAutoRickshawCost(distanceKm),
                  carbonImpact: 'medium',
                });
              }
            } else if (type === 'public') {
              routes.push({
                mode: 'public',
                name: 'Public Transit',
                description: 'Bus, metro, or train',
                icon: 'Bus',
                duration: durationMinutes,
                cost: this.calculatePublicTransitCost(distanceKm),
                carbonImpact: 'low',
              });
            } else if (type === 'walking') {
              routes.push({
                mode: 'walking',
                name: 'Walking',
                description: 'On foot',
                icon: 'PersonStanding',
                duration: durationMinutes,
                cost: { min: 0, max: 0 },
                carbonImpact: 'low',
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to get directions for ${type}:`, error);
        }
      }

      if (routes.length === 0) {
        throw new Error('No routes found between the specified locations');
      }

      return {
        routes,
        distance: Math.round(totalDistance * 10) / 10,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error('Failed to calculate routes. Please check your locations and try again.');
    }
  }

  private calculateDrivingCost(distanceKm: number): { min: number; max: number } {
    const fuelCost = Math.round(distanceKm * TRANSPORT_COSTS.petrolPerKm);
    const tollsAndParking = Math.round(distanceKm * 2); // Approximate tolls and parking
    
    return {
      min: fuelCost,
      max: fuelCost + tollsAndParking,
    };
  }

  private calculateRideshareCost(distanceKm: number): { min: number; max: number } {
    const olaCost = TRANSPORT_COSTS.olaBaseRate + (distanceKm * TRANSPORT_COSTS.olaPerKm);
    const uberCost = TRANSPORT_COSTS.uberBaseRate + (distanceKm * TRANSPORT_COSTS.uberPerKm);
    
    return {
      min: Math.round(Math.min(olaCost, uberCost)),
      max: Math.round(Math.max(olaCost, uberCost) * 1.5), // Surge pricing
    };
  }

  private calculateAutoRickshawCost(distanceKm: number): { min: number; max: number } {
    const baseCost = TRANSPORT_COSTS.autoRickshawBase + (distanceKm * TRANSPORT_COSTS.autoRickshawPerKm);
    
    return {
      min: Math.round(baseCost),
      max: Math.round(baseCost * 1.2), // Night charges or negotiation
    };
  }

  private calculatePublicTransitCost(distanceKm: number): { min: number; max: number } {
    const busCost = Math.max(10, distanceKm * TRANSPORT_COSTS.busPerKm);
    const metroCost = Math.max(15, distanceKm * TRANSPORT_COSTS.metroPerKm);
    
    return {
      min: Math.round(Math.min(busCost, metroCost)),
      max: Math.round(Math.max(busCost, metroCost)),
    };
  }
}

export const routeCalculationService = new RouteCalculationService();