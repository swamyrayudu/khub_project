'use client';

import React, { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface LocationModalProps {
  open: boolean;
  onLocationSet: () => void;
}

export function LocationModal({ open, onLocationSet }: LocationModalProps) {
  const [loading, setLoading] = useState(false);
  const [countries] = useState(() => Country.getAllCountries());
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [address, setAddress] = useState('');

  const [countryCode, setCountryCode] = useState('');
  const [stateCode, setStateCode] = useState('');

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry && countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setStates(countryStates);
      setSelectedState('');
      setStateCode('');
      setCities([]);
      setSelectedCity('');
    } else {
      setStates([]);
      setSelectedState('');
      setStateCode('');
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedCountry, countryCode]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState && countryCode && stateCode) {
      const stateCities = City.getCitiesOfState(countryCode, stateCode);
      setCities(stateCities);
      setSelectedCity('');
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState, countryCode, stateCode]);

  const handleCountryChange = (countryName: string) => {
    const country = countries.find((c) => c.name === countryName);
    if (country) {
      setSelectedCountry(country.name);
      setCountryCode(country.isoCode);
    }
  };

  const handleStateChange = (stateName: string) => {
    const state = states.find((s) => s.name === stateName);
    if (state) {
      setSelectedState(state.name);
      setStateCode(state.isoCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCountry || !selectedState || !selectedCity || !address.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/set-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry,
          countryCode,
          state: selectedState,
          stateCode,
          city: selectedCity,
          address: address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save location');
      }

      toast.success('Location saved successfully!');
      onLocationSet();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error(error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Set Your Location</DialogTitle>
          <DialogDescription className="text-center">
            Please provide your location details to continue. This helps us personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange} required>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.name}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">
              State / Province <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedState}
              onValueChange={handleStateChange}
              disabled={!selectedCountry}
              required
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {states.length > 0 ? (
                  states.map((state) => (
                    <SelectItem key={state.isoCode} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    {selectedCountry ? 'No states available' : 'Select a country first'}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedState}
              required
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    {selectedState ? 'No cities available' : 'Select a state first'}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Full Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="Enter your street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Location'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            * All fields are required. You can update your location later in settings.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
