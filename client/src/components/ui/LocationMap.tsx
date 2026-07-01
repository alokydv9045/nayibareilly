"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, RotateCcw, Crosshair, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/helpers';
import { useTranslation, Language } from '@/lib/utils/translations';

// Types for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface MarkerData {
  id: string | number;
  name: string;
  position: [number, number];
  color?: string;
  priority?: string;
  category?: string;
}

export interface LocationMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  selectedLocation?: LocationData;
  onLocationSelect?: (location: LocationData) => void;
  onMapClick?: (event: { lat: number; lng: number }) => void;
  className?: string;
  height?: string;
  interactive?: boolean;
  showUserLocation?: boolean;
  language?: Language;
  accuracy?: number;
}

// Default center for Bareilly, Uttar Pradesh
const DEFAULT_CENTER: [number, number] = [28.3670, 79.4304];
const DEFAULT_ZOOM = 13;

// Location accuracy levels
const ACCURACY_LEVELS = {
  HIGH: 50, // meters
  MEDIUM: 100,
  LOW: 500
};

export default function LocationMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  selectedLocation,
  onLocationSelect,
  onMapClick,
  className,
  height = "400px",
  interactive = true,
  showUserLocation = true,
  language = 'en',
  accuracy
}: LocationMapProps) {
  const [map, setMap] = useState<unknown>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<unknown[]>([]);
  const userMarkerRef = useRef<unknown>(null);
  const selectedMarkerRef = useRef<unknown>(null);

  const t = useTranslation(language);

  // Load Leaflet dynamically
  const loadLeaflet = useCallback(async () => {
    if (typeof window === 'undefined') return null;

    try {
      // Dynamic import
      const L = await import('leaflet');
      
      // Fix default icon issue
      if ((L as unknown as { Icon?: { Default?: { prototype?: Record<string, unknown>; mergeOptions?: (opts: Record<string, unknown>) => void } } }).Icon?.Default?.prototype) {
        delete (L as unknown as { Icon: { Default: { prototype: Record<string, unknown> } } }).Icon.Default.prototype._getIconUrl;
        (L as unknown as { Icon: { Default: { mergeOptions: (opts: Record<string, unknown>) => void } } }).Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }

      return L;
    } catch (error) {
      console.error('Failed to load Leaflet:', error);
      return null;
    }
  }, []);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current || map) return;

    const L = await loadLeaflet();
    if (!L) return;

    try {
      const mapInstance = (L as unknown as { 
        map: (el: HTMLElement, opts: Record<string, unknown>) => unknown;
        tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (map: unknown) => void };
      }).map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        attributionControl: false
      });

      // Add tile layer
      (L as unknown as { tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (map: unknown) => void } }).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Â© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      // Handle map clicks
      if (interactive && onMapClick) {
        (mapInstance as { on: (event: string, handler: (e: { latlng: { lat: number; lng: number } }) => void) => void }).on('click', (e: { latlng: { lat: number; lng: number } }) => {
          const { lat, lng } = e.latlng;
          onMapClick({ lat, lng });
        });
      }

      setMap(mapInstance);
      setIsMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLocationError('Failed to load map');
    }
  }, [center, zoom, interactive, onMapClick, map, loadLeaflet]);

  // Get user's current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError(t.locationNotSupported);
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setUserLocation(location);
      
      if (onLocationSelect) {
        onLocationSelect(location);
      }

      // Center map on user location
      if (map) {
        (map as { setView: (center: [number, number], zoom: number) => void }).setView([location.latitude, location.longitude], 16);
      }

    } catch (error: unknown) {
      let errorMessage = t.locationError;
      
      if (error && typeof error === 'object' && 'code' in error) {
        const geoError = error as GeolocationPositionError;
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage = t.locationPermissionDenied;
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage = t.locationUnavailable;
            break;
          case geoError.TIMEOUT:
            errorMessage = t.locationTimeout;
            break;
        }
      }
      
      setLocationError(errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [map, onLocationSelect, t]);

  // Create custom marker icon
  const createMarkerIcon = useCallback(async (type: 'user' | 'selected' | 'marker', _color = '#3B82F6', priority?: string) => {
    const L = await loadLeaflet();
    if (!L) return null;

    const iconColor = priority === 'critical' ? '#EF4444' : 
                     priority === 'high' ? '#F59E0B' :
                     priority === 'medium' ? '#3B82F6' : '#10B981';

    const iconHtml = type === 'user' ? 
      `<div style="background: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>` :
      `<div style="background: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>`;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: type === 'user' ? [20, 20] : [12, 12],
      iconAnchor: type === 'user' ? [10, 10] : [6, 6]
    });
  }, [loadLeaflet]);

  // Add user location marker
  const addUserLocationMarker = useCallback(async () => {
    if (!map || !userLocation) return;

    const L = await loadLeaflet();
    if (!L) return;

    // Remove existing user marker
    if (userMarkerRef.current && map) {
      (map as { removeLayer: (layer: unknown) => void }).removeLayer(userMarkerRef.current);
    }

    const icon = await createMarkerIcon('user', '#3B82F6');
    if (!icon) return;

    const marker = (L as unknown as { 
      marker: (pos: [number, number], opts: { icon: unknown }) => unknown;
      circle: (pos: [number, number], opts: Record<string, unknown>) => { addTo: (map: unknown) => void };
    }).marker([userLocation.latitude, userLocation.longitude], { icon });
    
    // Add popup and to map
    if (marker && typeof marker === 'object' && 'bindPopup' in marker && 'addTo' in marker) {
      (marker as { bindPopup: (content: string) => { addTo: (map: unknown) => unknown } }).bindPopup(`
        <div class="text-sm">
          <strong>${t.yourLocation}</strong><br/>
          <small>${t.accuracy}: ${userLocation.accuracy ? Math.round(userLocation.accuracy) + 'm' : 'Unknown'}</small>
        </div>
      `).addTo(map);
    }

    // Add accuracy circle if available
    if (userLocation.accuracy && userLocation.accuracy < 1000) {
      const accuracyColor = userLocation.accuracy <= ACCURACY_LEVELS.HIGH ? '#10B981' :
                           userLocation.accuracy <= ACCURACY_LEVELS.MEDIUM ? '#F59E0B' : '#EF4444';
      
      L.circle([userLocation.latitude, userLocation.longitude], {
        radius: userLocation.accuracy,
        color: accuracyColor,
        fillColor: accuracyColor,
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);
    }

    userMarkerRef.current = marker;
  }, [map, userLocation, createMarkerIcon, loadLeaflet, t]);

  // Add selected location marker
  const addSelectedLocationMarker = useCallback(async () => {
    if (!map || !selectedLocation) return;

    const L = await loadLeaflet();
    if (!L) return;

    // Remove existing selected marker
    if (selectedMarkerRef.current && map) {
      (map as { removeLayer: (layer: unknown) => void }).removeLayer(selectedMarkerRef.current);
    }

    const icon = await createMarkerIcon('selected', '#EF4444');
    if (!icon) return;

    const marker = (L as unknown as { 
      marker: (pos: [number, number], opts: { icon: unknown }) => unknown;
    }).marker([selectedLocation.latitude, selectedLocation.longitude], { icon });
    
    // Add popup and to map
    if (marker && typeof marker === 'object' && 'bindPopup' in marker && 'addTo' in marker) {
      (marker as { bindPopup: (content: string) => { addTo: (map: unknown) => unknown } }).bindPopup(`
        <div class="text-sm">
          <strong>${t.selectedLocation}</strong><br/>
          ${selectedLocation.address ? `<small>${selectedLocation.address}</small>` : ''}
        </div>
      `).addTo(map);
    }

    selectedMarkerRef.current = marker;
  }, [map, selectedLocation, createMarkerIcon, loadLeaflet, t]);

  // Add markers
  const addMarkers = useCallback(async () => {
    if (!map || !markers.length) return;

    const L = await loadLeaflet();
    if (!L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (map) {
        (map as { removeLayer: (layer: unknown) => void }).removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add new markers
    for (const markerData of markers) {
      const icon = await createMarkerIcon('marker', markerData.color, markerData.priority);
      if (!icon) continue;

      const marker = (L as unknown as { 
        marker: (pos: [number, number], opts: { icon: unknown }) => unknown;
      }).marker(markerData.position, { icon });
      
      // Add popup and to map
      if (marker && typeof marker === 'object' && 'bindPopup' in marker && 'addTo' in marker) {
        (marker as { bindPopup: (content: string) => { addTo: (map: unknown) => unknown } }).bindPopup(`
          <div class="text-sm">
            <strong>${markerData.name}</strong><br/>
            ${markerData.category ? `<small>${markerData.category}</small><br/>` : ''}
            ${markerData.priority ? `<span class="inline-block px-2 py-1 text-xs rounded ${
              markerData.priority === 'critical' ? 'bg-red-100 text-red-800' :
              markerData.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
              markerData.priority === 'medium' ? 'bg-emerald-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }">${markerData.priority}</span>` : ''}
          </div>
        `).addTo(map);

        markersRef.current.push(marker);
      }
    }
  }, [map, markers, createMarkerIcon, loadLeaflet]);

  // Get accuracy level and color
  const getAccuracyInfo = useCallback((acc?: number) => {
    if (!acc) return { level: 'unknown', color: 'gray', text: t.accuracyUnknown };
    
    if (acc <= ACCURACY_LEVELS.HIGH) {
      return { level: 'high', color: 'green', text: t.accuracyHigh };
    } else if (acc <= ACCURACY_LEVELS.MEDIUM) {
      return { level: 'medium', color: 'yellow', text: t.accuracyMedium };
    } else {
      return { level: 'low', color: 'red', text: t.accuracyLow };
    }
  }, [t]);

  // Initialize map on mount
  // We intentionally run this just once on mount. initializeMap already
  // guards against re-initialization via refs and state.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map) {
        (map as { remove: () => void }).remove();
        setMap(null);
      }
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Update user location marker
  useEffect(() => {
    if (isMapLoaded && showUserLocation) {
      addUserLocationMarker();
    }
  }, [isMapLoaded, addUserLocationMarker, showUserLocation]);

  // Update selected location marker
  useEffect(() => {
    if (isMapLoaded) {
      addSelectedLocationMarker();
    }
  }, [isMapLoaded, addSelectedLocationMarker]);

  // Update markers
  useEffect(() => {
    if (isMapLoaded) {
      addMarkers();
    }
  }, [isMapLoaded, addMarkers]);

  // Update map center and zoom
  useEffect(() => {
    if (map && center) {
      (map as { setView: (center: [number, number], zoom: number) => void }).setView(center, zoom);
    }
  }, [map, center, zoom]);

  const accuracyInfo = getAccuracyInfo(accuracy || userLocation?.accuracy);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Map Container */}
          <div 
            ref={mapContainerRef}
            style={{ height }}
            className="w-full bg-slate-100"
          />

          {/* Loading overlay */}
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">{t.loadingMap}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          {interactive && isMapLoaded && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-2">
              {showUserLocation && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="shadow-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
                  aria-label="Get current location"
                >
                  {isLoadingLocation ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current" />
                  ) : (
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="secondary"
                onClick={() => (map as { setView?: (center: [number, number], zoom: number) => void } | null)?.setView?.(center, DEFAULT_ZOOM)}
                className="shadow-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
                aria-label="Reset map view"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}

          {/* Location info */}
          {(userLocation || selectedLocation || accuracy) && (
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    {selectedLocation && (
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          {t.selectedLocation}
                        </span>
                      </div>
                    )}
                    
                    {userLocation && showUserLocation && (
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Crosshair className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          {t.yourLocation}
                        </span>
                      </div>
                    )}
                    
                    {(accuracy || userLocation?.accuracy) && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Badge 
                          variant={accuracyInfo.level === 'high' ? 'default' : 'secondary'}
                          className={cn(
                            "text-xs px-1 py-0.5 sm:px-2 sm:py-1",
                            accuracyInfo.level === 'high' && "bg-green-100 text-green-800",
                            accuracyInfo.level === 'medium' && "bg-yellow-100 text-yellow-800",
                            accuracyInfo.level === 'low' && "bg-red-100 text-red-800"
                          )}
                        >
                          <span className="hidden sm:inline">{accuracyInfo.text}</span>
                          <span className="sm:hidden">{accuracyInfo.level.charAt(0).toUpperCase()}</span>
                          {' '}({Math.round(accuracy || userLocation?.accuracy || 0)}m)
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {locationError && (
            <div className="absolute top-2 left-2 right-12 sm:top-4 sm:left-4 sm:right-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 shadow-lg">
                <div className="flex items-start gap-1 sm:gap-2">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-red-800 leading-tight">{locationError}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}