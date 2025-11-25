'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  MapPin,
  Edit,
  Save,
  X,
  Loader2,
  Calendar,
  Globe,
  Home,
  Shield,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Country, State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  country: string | null;
  countryCode: string | null;
  state: string | null;
  stateCode: string | null;
  city: string | null;
  address: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hasCompletedProfile: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [countries] = useState(() => Country.getAllCountries());
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [editCountry, setEditCountry] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('');
  const [editState, setEditState] = useState('');
  const [editStateCode, setEditStateCode] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  // Load states when country changes
  useEffect(() => {
    if (editCountry && editCountryCode) {
      const countryStates = State.getStatesOfCountry(editCountryCode);
      setStates(countryStates);
      if (editState && !countryStates.find(s => s.name === editState)) {
        setEditState('');
        setEditStateCode('');
      }
    } else {
      setStates([]);
      setEditState('');
      setEditStateCode('');
    }
  }, [editCountry, editCountryCode]);

  // Load cities when state changes
  useEffect(() => {
    if (editState && editCountryCode && editStateCode) {
      const stateCities = City.getCitiesOfState(editCountryCode, editStateCode);
      setCities(stateCities);
      if (editCity && !stateCities.find(c => c.name === editCity)) {
        setEditCity('');
      }
    } else {
      setCities([]);
      setEditCity('');
    }
  }, [editState, editCountryCode, editStateCode]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile-status');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (profile) {
      setEditCountry(profile.country || '');
      setEditCountryCode(profile.countryCode || '');
      setEditState(profile.state || '');
      setEditStateCode(profile.stateCode || '');
      setEditCity(profile.city || '');
      setEditAddress(profile.address || '');
    }
    setEditDialogOpen(true);
  };

  const handleCountryChange = (countryName: string) => {
    const country = countries.find((c) => c.name === countryName);
    if (country) {
      setEditCountry(country.name);
      setEditCountryCode(country.isoCode);
    }
  };

  const handleStateChange = (stateName: string) => {
    const state = states.find((s) => s.name === stateName);
    if (state) {
      setEditState(state.name);
      setEditStateCode(state.isoCode);
    }
  };

  const handleSaveAddress = async () => {
    if (!editCountry || !editState || !editCity || !editAddress.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user/set-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: editCountry,
          countryCode: editCountryCode,
          state: editState,
          stateCode: editStateCode,
          city: editCity,
          address: editAddress.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      toast.success('Address updated successfully!');
      setEditDialogOpen(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.error(error.message || 'Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 ring-4 ring-primary/10">
                <AvatarImage src={profile.image || ''} alt={profile.name || ''} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                  {profile.name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-1">{profile.name || 'User'}</h2>
                <p className="text-muted-foreground mb-3">{profile.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {profile.emailVerified && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {profile.hasCompletedProfile && (
                    <Badge variant="outline" className="gap-1">
                      <User className="w-3 h-3" />
                      Profile Complete
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{profile.name || 'Not set'}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{profile.email}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Member Since</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </CardTitle>
                  <CardDescription>Your address information</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.country ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Country</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{profile.country}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">State / Province</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{profile.state}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">City</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{profile.city}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Full Address</Label>
                    <div className="flex items-start gap-2">
                      <Home className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <span className="font-medium">{profile.address}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">No location set</p>
                  <Button onClick={handleEditClick} size="sm" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Add Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Statistics Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>Your account statistics and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant="default" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Address Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Edit Location
            </DialogTitle>
            <DialogDescription>
              Update your address details. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Country */}
            <div className="space-y-2">
              <Label>
                Country <span className="text-destructive">*</span>
              </Label>
              <Select value={editCountry} onValueChange={handleCountryChange}>
                <SelectTrigger>
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
              <Label>
                State / Province <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editState}
                onValueChange={handleStateChange}
                disabled={!editCountry}
              >
                <SelectTrigger>
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
                      Select a country first
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>
                City <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editCity}
                onValueChange={setEditCity}
                disabled={!editState}
              >
                <SelectTrigger>
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
                      Select a state first
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="edit-address">
                Full Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-address"
                placeholder="Enter your street address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
