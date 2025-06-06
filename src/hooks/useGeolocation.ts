import { useState, useCallback } from 'react';
import { GeolocationState } from '../types';
import { googleMapsService } from '../services/googleMapsService';

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
  });

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      // Get address from coordinates using Google Maps
      await googleMapsService.initialize();
      const address = await googleMapsService.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );

      setState({
        loading: false,
        error: null,
        position,
        address,
      });

      return address;
    } catch (error: any) {
      let errorMessage = 'Unable to retrieve your location';
      
      if (error.code) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      setState({
        loading: false,
        error: errorMessage,
        position: null,
      });
    }
  }, []);

  return {
    ...state,
    getCurrentLocation,
  };
};