'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  ArrowLeft, 
  Route as RouteIcon, 
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

interface ProductLocation {
  productId: string;
  productName: string;
  latitude: number;
  longitude: number;
  shopName: string;
  address: string;
}

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [productLocation, setProductLocation] = useState<ProductLocation | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    try {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const productName = searchParams.get('name');
      const shopName = searchParams.get('shop');
      const address = searchParams.get('address');
      const productId = searchParams.get('id');

      if (lat && lng && productName) {
        setProductLocation({
          productId: productId || '',
          productName: decodeURIComponent(productName),
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          shopName: shopName ? decodeURIComponent(shopName) : '',
          address: address ? decodeURIComponent(address) : '',
        });
      } else {
        toast.error('Invalid location data');
        setTimeout(() => router.back(), 2000);
      }
    } catch (error) {
      console.error('Error parsing location:', error);
      toast.error('Failed to load location');
    }
  }, [searchParams, router]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationError('');
        setLoading(false);
        if (map) map.panTo(location);
      },
      (error) => {
        setLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Please allow location access');
            break;
          default:
            setLocationError('Cannot get location');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [map]);

  useEffect(() => {
    if (isLoaded && !loadError) {
      getUserLocation();
    }
  }, [isLoaded, loadError, getUserLocation]);

  const showDirections = useCallback(() => {
    if (!userLocation || !productLocation || !isLoaded) {
      toast.error('Location not ready');
      return;
    }

    setCalculatingRoute(true);
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination: new google.maps.LatLng(productLocation.latitude, productLocation.longitude),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setCalculatingRoute(false);
        
        if (status === 'OK' && result) {
          setDirections(result);
          if (map && result.routes[0]?.bounds) {
            map.fitBounds(result.routes[0].bounds);
          }
          toast.success('Route displayed!');
        } else {
          console.error('Directions failed:', status);
          
          if (status === 'REQUEST_DENIED') {
            toast.error('Directions API is being activated. Please wait 5-10 minutes and try again.', { 
              autoClose: 7000 
            });
          } else {
            toast.error('Unable to show directions. Please try again.');
          }
        }
      }
    );
  }, [userLocation, productLocation, isLoaded, map]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Google Maps Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Failed to load Google Maps.</p>
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded">
              <p className="text-xs font-semibold mb-2">Wait Time Required:</p>
              <p className="text-xs">If you just enabled the APIs, please wait 5-10 minutes for activation.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} className="flex-1">Retry</Button>
              <Button variant="outline" onClick={() => router.back()} className="flex-1">Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="font-medium">{!isLoaded ? 'Loading map...' : 'Getting location...'}</p>
        </div>
      </div>
    );
  }

  if (locationError && !userLocation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Location Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-destructive">{locationError}</p>
            <div className="flex gap-2">
              <Button onClick={getUserLocation} className="flex-1">Try Again</Button>
              <Button variant="outline" onClick={() => router.back()} className="flex-1">Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b bg-card px-4 py-3 shadow-sm">
        <div className="container mx-auto max-w-7xl flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Product Location</h1>
            <p className="text-sm text-muted-foreground line-clamp-1">{productLocation?.productName}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={productLocation ? {
              lat: productLocation.latitude,
              lng: productLocation.longitude
            } : defaultCenter}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
                title="Your Location"
              />
            )}

            {productLocation && (
              <Marker
                position={{
                  lat: productLocation.latitude,
                  lng: productLocation.longitude,
                }}
                title={productLocation.productName}
              />
            )}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}
          </GoogleMap>
        </div>

        <div className="absolute top-4 left-4 right-4 z-10 max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                {productLocation?.productName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {productLocation?.shopName && (
                <p className="text-xs text-muted-foreground">🏪 {productLocation.shopName}</p>
              )}
              {productLocation?.address && (
                <p className="text-xs text-muted-foreground">📍 {productLocation.address}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-10 max-w-md mx-auto">
          <Button
            className="w-full h-14 text-base font-semibold shadow-xl"
            onClick={showDirections}
            disabled={!userLocation || !productLocation || calculatingRoute}
          >
            {calculatingRoute ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <RouteIcon className="w-5 h-5 mr-2" />
                Show Directions
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Map() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <MapContent />
    </Suspense>
  );
}
