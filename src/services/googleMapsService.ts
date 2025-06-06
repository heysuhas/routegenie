interface GoogleMapsConfig {
  apiKey: string;
  region: string;
  language: string;
}

interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      duration_in_traffic?: { text: string; value: number };
    }>;
  }>;
}

class GoogleMapsService {
  private config: GoogleMapsConfig;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      region: 'IN',
      language: 'en',
    };
  }

  async initialize(): Promise<void> {
    // If already initialized or initialization is in progress, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If Google Maps is already loaded, initialize services immediately
    if (window.google?.maps) {
      this.initializeServices();
      return Promise.resolve();
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Script is already loading, wait for it to complete
      this.initializationPromise = new Promise((resolve, reject) => {
        const checkGoogleMaps = () => {
          if (window.google?.maps) {
            this.initializeServices();
            resolve();
          } else {
            setTimeout(checkGoogleMaps, 100);
          }
        };
        
        existingScript.addEventListener('load', checkGoogleMaps);
        existingScript.addEventListener('error', () => {
          reject(new Error('Failed to load Google Maps API'));
        });
      });
      
      return this.initializationPromise;
    }

    // Create and load the script
    this.initializationPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.config.apiKey}&libraries=places&region=${this.config.region}&language=${this.config.language}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.initializeServices();
        resolve();
      };
      
      script.onerror = () => {
        this.initializationPromise = null; // Reset so it can be retried
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });

    return this.initializationPromise;
  }

  private initializeServices(): void {
    if (window.google?.maps) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.directionsService = new google.maps.DirectionsService();
      
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(dummyDiv);
    }
  }

  async getPlacePredictions(input: string): Promise<PlaceAutocompleteResult[]> {
    if (!this.autocompleteService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        reject(new Error('Autocomplete service not available'));
        return;
      }

      this.autocompleteService.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'IN' },
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
    if (!this.placesService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not available'));
        return;
      }

      this.placesService.getDetails(
        {
          placeId,
          fields: ['geometry', 'formatted_address', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error(`Place details error: ${status}`));
          }
        }
      );
    });
  }

  async getDirections(
    origin: string,
    destination: string,
    travelMode: google.maps.TravelMode
  ): Promise<DirectionsResult> {
    if (!this.directionsService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.directionsService) {
        reject(new Error('Directions service not available'));
        return;
      }

      this.directionsService.route(
        {
          origin,
          destination,
          travelMode,
          region: 'IN',
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
          transitOptions: {
            departureTime: new Date(),
          },
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions error: ${status}`));
          }
        }
      );
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!window.google?.maps) {
      await this.initialize();
    }
    
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        {
          location: { lat, lng },
          region: 'IN',
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Geocoding error: ${status}`));
          }
        }
      );
    });
  }
}

export const googleMapsService = new GoogleMapsService();