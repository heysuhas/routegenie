import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, AlertCircle, ArrowUpDown } from 'lucide-react';
import { Location, RouteRequest } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationInput } from './LocationInput';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchFormProps {
  onSearch: (request: RouteRequest) => void;
  loading?: boolean;
}

interface FormData {
  origin: string;
  destination: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading = false }) => {
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const { getCurrentLocation, loading: geoLoading, error: geoError } = useGeolocation();

  const {
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormData>();

  const handleLocationDetection = async () => {
    try {
      const address = await getCurrentLocation();
      if (address) {
        setOriginValue(address);
        clearErrors('origin');
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const swapLocations = () => {
    const temp = originValue;
    setOriginValue(destinationValue);
    setDestinationValue(temp);
  };

  const onSubmit = () => {
    // Validate inputs
    if (!originValue.trim()) {
      setError('origin', { message: 'Starting location is required' });
      return;
    }
    if (!destinationValue.trim()) {
      setError('destination', { message: 'Destination is required' });
      return;
    }

    const request: RouteRequest = {
      origin: { address: originValue.trim() },
      destination: { address: destinationValue.trim() },
    };
    onSearch(request);
  };

  return (
    <div className="bg-glass/90 backdrop-blur-glass rounded-2xl shadow-glass border border-primary-800/40 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-700/40 rounded-xl shadow-neo-inset">
          <Search className="w-7 h-7 text-primary-300 drop-shadow-glow" />
        </div>
        <h2 className="text-2xl font-bold text-white font-urbanist tracking-tight drop-shadow-glow">
          Find Your Route
        </h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Origin Input */}
        <div className="space-y-2">
          <label htmlFor="origin" className="block text-sm font-medium text-primary-200">
            From
          </label>
          <LocationInput
            value={originValue}
            onChange={setOriginValue}
            placeholder="Enter starting location"
            showCurrentLocation={true}
            onCurrentLocationClick={handleLocationDetection}
            currentLocationLoading={geoLoading}
            error={errors.origin?.message}
            icon="origin"
          />
          {errors.origin && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.origin.message}
            </p>
          )}
          {geoError && (
            <p className="text-sm text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {geoError}
            </p>
          )}
        </div>
        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swapLocations}
            className="p-2 bg-secondary-800 hover:bg-secondary-700 rounded-full shadow-neo-inset transition-colors duration-300 text-primary-200 hover:text-white border border-primary-800/30"
            title="Swap locations"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>
        {/* Destination Input */}
        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-medium text-primary-200">
            To
          </label>
          <LocationInput
            value={destinationValue}
            onChange={setDestinationValue}
            placeholder="Enter destination"
            icon="destination"
            error={errors.destination?.message}
          />
          {errors.destination && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.destination.message}
            </p>
          )}
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-600 text-white py-3 px-6 rounded-xl shadow-neo hover:shadow-glass hover:scale-[1.02] focus:ring-4 focus:ring-primary-800/40 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2 font-urbanist"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="border-white border-t-white/30" />
              Searching Routes...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Compare Routes
            </>
          )}
        </button>
      </form>
    </div>
  );
};