import { useState, useCallback } from 'react';
import { RouteRequest, RouteResponse } from '../types';
import { routeCalculationService } from '../services/routeCalculationService';

export const useRouteData = () => {
  const [data, setData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async (request: RouteRequest) => {
    if (!request.origin.address || !request.destination.address) {
      setError('Both origin and destination are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const routeData = await routeCalculationService.calculateRoutes(request);
      setData(routeData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch route data. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchRoutes,
    clearData,
  };
};