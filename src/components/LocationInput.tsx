import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';
import { LoadingSpinner } from './LoadingSpinner';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showCurrentLocation?: boolean;
  onCurrentLocationClick?: () => void;
  currentLocationLoading?: boolean;
  error?: string;
  icon?: 'origin' | 'destination';
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder,
  showCurrentLocation = false,
  onCurrentLocationClick,
  currentLocationLoading = false,
  error,
  icon = 'origin',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, loading, getSuggestions, clearSuggestions } = useLocationAutocomplete();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    getSuggestions(newValue);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.description);
    onChange(suggestion.description);
    setIsOpen(false);
    clearSuggestions();
  };

  const handleCurrentLocationClick = () => {
    if (onCurrentLocationClick) {
      onCurrentLocationClick();
    }
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const iconColor = icon === 'origin' ? 'text-green-400' : 'text-red-400';

  return (
    <div ref={containerRef} className="relative font-urbanist">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className={`h-5 w-5 ${iconColor}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`block w-full pl-10 pr-20 py-3 rounded-xl bg-secondary-900/80 text-white border border-primary-800/40 shadow-neo-inset focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-300 font-urbanist placeholder:text-primary-300 ${
            error ? 'border-red-400' : 'border-primary-800/40'
          }`}
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {inputValue && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 mr-1 text-primary-300 hover:text-white transition-colors duration-300"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showCurrentLocation && (
            <button
              type="button"
              onClick={handleCurrentLocationClick}
              disabled={currentLocationLoading}
              className="p-2 mr-2 text-primary-300 hover:text-green-400 transition-colors duration-300 disabled:opacity-50"
              title="Use current location"
            >
              {currentLocationLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 w-full mt-1 bg-secondary-900/95 backdrop-blur-glass border border-primary-400/80 rounded-2xl shadow-glass max-h-60 overflow-y-auto ring-1 ring-primary-400/30">
          {loading && (
            <div className="p-3 flex items-center gap-2 text-primary-200">
              <LoadingSpinner size="sm" />
              <span className="text-sm">Searching locations...</span>
            </div>
          )}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left p-3 bg-secondary-800/80 hover:bg-primary-700/40 border-b border-primary-800/20 last:border-b-0 transition-colors duration-200 text-white font-urbanist rounded-xl"
            >
              <div className="font-semibold text-primary-100">{suggestion.main_text}</div>
              <div className="text-sm text-primary-300">{suggestion.secondary_text}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};