import { useState, useCallback, useEffect } from 'react';
import { googleMapsService } from '../services/googleMapsService';

interface AutocompleteResult {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export const useLocationAutocomplete = () => {
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const predictions = await googleMapsService.getPlacePredictions(input);
      
      const formattedSuggestions: AutocompleteResult[] = predictions.map(prediction => ({
        place_id: prediction.place_id,
        description: prediction.description,
        main_text: prediction.structured_formatting.main_text,
        secondary_text: prediction.structured_formatting.secondary_text,
      }));

      setSuggestions(formattedSuggestions);
    } catch (err) {
      setError('Failed to fetch location suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions,
  };
};