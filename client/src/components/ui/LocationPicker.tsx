"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Search, Crosshair, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { useTranslation, Language } from '@/lib/utils/translations';
import dynamic from 'next/dynamic';

// Lazy load map to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/features/citizen/LeafletMap'), { ssr: false });

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  language: Language;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

interface GeolocationError {
  code: number;
  message: string;
}

const ACCURACY_THRESHOLDS = {
  HIGH: 10, // meters
  MEDIUM: 50, // meters
  LOW: 100, // meters
};

export default function LocationPicker({
  value,
  onChange,
  language,
  className,
  disabled = false,
  required = false,
}: LocationPickerProps) {
  const t = useTranslation(language);
  const [currentTab, setCurrentTab] = useState<'gps' | 'search' | 'map'>('gps');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]); // Default to Delhi
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Clear search timeout on unmount
  useEffect(() => {
    const currentWatchId = watchIdRef.current;
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (currentWatchId !== null) {
        navigator.geolocation.clearWatch(currentWatchId);
      }
    };
  }, []);

  // Update map center when value changes
  useEffect(() => {
    if (value) {
      setMapCenter([value.latitude, value.longitude]);
    }
  }, [value]);

  const getAccuracyLevel = (accuracy?: number): 'high' | 'medium' | 'low' => {
    if (!accuracy) return 'low';
    if (accuracy <= ACCURACY_THRESHOLDS.HIGH) return 'high';
    if (accuracy <= ACCURACY_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  };

  const getAccuracyColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
    }
  };

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      // Using Nominatim for reverse geocoding (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      return data.display_name;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return undefined;
    }
  }, [language]);

  const searchLocation = useCallback(async (query: string): Promise<LocationData[]> => {
    try {
      // Using Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data: NominatimResult[] = await response.json();
      return data.map((item: NominatimResult) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: item.display_name,
        accuracy: undefined,
      }));
    } catch (err) {
      console.error('Geocoding error:', err);
      throw err;
    }
  }, [language]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Get address for the location
      const address = await reverseGeocode(latitude, longitude);
      
      const locationData: LocationData = {
        latitude,
        longitude,
        accuracy,
        address,
      };
      
      onChange(locationData);
      setIsGettingLocation(false);
      setMapCenter([latitude, longitude]);
    };

    const error = (err: GeolocationError) => {
      setIsGettingLocation(false);
      switch (err.code) {
        case 1: // PERMISSION_DENIED
          setError(t.errors.gpsError);
          break;
        case 2: // POSITION_UNAVAILABLE
          setError('Location information is unavailable');
          break;
        case 3: // TIMEOUT
          setError('The request to get location timed out');
          break;
        default:
          setError('An unknown error occurred while getting location');
          break;
      }
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  }, [onChange, t.errors.gpsError, reverseGeocode]);

  const handleSearchInput = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocation(query);
        setSearchResults(results);
      } catch {
        setError(t.errors.geocodingError);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, [t.errors.geocodingError, searchLocation]);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    
    const locationData: LocationData = {
      latitude: lat,
      longitude: lng,
      address,
      accuracy: undefined,
    };
    
    onChange(locationData);
  }, [onChange, reverseGeocode]);

  const handleSearchResultSelect = (result: LocationData) => {
    onChange(result);
    setCurrentTab('map');
    setMapCenter([result.latitude, result.longitude]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const accuracyLevel = getAccuracyLevel(value?.accuracy);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Navigation */}
      <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentTab === 'gps'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setCurrentTab('gps')}
          disabled={disabled}
        >
          <Navigation className="h-4 w-4" />
          {t.useCurrentLocation}
        </button>
        
        <button
          type="button"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentTab === 'search'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setCurrentTab('search')}
          disabled={disabled}
        >
          <Search className="h-4 w-4" />
          {t.searchAddress}
        </button>
        
        <button
          type="button"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentTab === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={() => setCurrentTab('map')}
          disabled={disabled}
        >
          <MapPin className="h-4 w-4" />
          {t.dropPin}
        </button>
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-4">
          {currentTab === 'gps' && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={getCurrentLocation}
                  disabled={disabled || isGettingLocation}
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4 mr-2" />
                      {t.useCurrentLocation}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Click to allow location access and get your current position
              </div>
            </div>
          )}

          {currentTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for an address or landmark..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="pl-10"
                  disabled={disabled}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  </div>
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border transition-colors"
                      onClick={() => handleSearchResultSelect(result)}
                      disabled={disabled}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.address?.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {result.address}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'map' && (
            <div className="space-y-4">
              <div className="h-64 w-full rounded-lg overflow-hidden border">
                <LeafletMap
                  center={mapCenter}
                  zoom={value ? 16 : 13}
                  onClick={handleMapClick}
                  markers={value ? [{ 
                    id: 'selected-location', 
                    name: 'Selected Location',
                    position: [value.latitude, value.longitude] as [number, number] 
                  }] : []}
                />
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                {t.dragPin}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Location Display */}
      {value && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    Location Selected
                  </p>
                  {value.accuracy && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        accuracyLevel === 'high' && 'border-green-500 text-green-700',
                        accuracyLevel === 'medium' && 'border-yellow-500 text-yellow-700',
                        accuracyLevel === 'low' && 'border-red-500 text-red-700'
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full mr-1', getAccuracyColor(accuracyLevel))} />
                      {Math.round(value.accuracy)}m accuracy
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 truncate">
                  {value.address || `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`}
                </p>
                
                <p className="text-xs text-gray-400 mt-1">
                  {t.exactAddress}
                </p>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                disabled={disabled}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Required Field Indicator */}
      {required && !value && (
        <div className="text-xs text-red-600">
          {t.errors.locationRequired}
        </div>
      )}
    </div>
  );
}