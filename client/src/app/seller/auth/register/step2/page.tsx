"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import { useRegistrationProtection } from '@/lib/hooks/useRegistrationProtection';
import { 
  Sun, 
  Moon, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Store, 
  Phone, 
  MapPin, 
  Globe, 
  Building, 
  FileText 
} from 'lucide-react';

interface FormData {
  shopName: string;
  contactNumber: string;
  address: string;
  country: string;
  state: string;
  city: string;
  shopId: File | null;
  shopIdUrl: string;
}

interface LocationData {
  countries: Array<{ isoCode: string; name: string }>;
  states: Array<{ isoCode: string; name: string }>;
  cities: Array<{ name: string }>;
}

export default function Step2() {
  const router = useRouter();
  const { isLoading, canAccess } = useRegistrationProtection(2);
  const [darkMode, setDarkMode] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    shopName: '',
    contactNumber: '',
    address: '',
    country: '',
    state: '',
    city: '',
    shopId: null,
    shopIdUrl: '',
  });

  const [locationData, setLocationData] = useState<LocationData>({
    countries: [],
    states: [],
    cities: [],
  });

  const [uploading, setUploading] = useState<{ shopId: boolean }>({ 
    shopId: false 
  });

  const [uploadProgress, setUploadProgress] = useState<{ shopId: string }>({ 
    shopId: '' 
  });
  
  // At the top of your Step1 component
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      toast.warning('You are already logged in. Are you sure you want to create another account?', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  }, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // Load countries on component mount
  useEffect(() => {
    const countries = Country.getAllCountries();
    setLocationData(prev => ({
      ...prev,
      countries: countries,
    }));
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      const states = State.getStatesOfCountry(formData.country);
      setLocationData(prev => ({
        ...prev,
        states: states,
        cities: [], // Clear cities when country changes
      }));
      setFormData(prev => ({
        ...prev,
        state: '', // Reset state
        city: '', // Reset city
      }));
    }
  }, [formData.country]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const cities = City.getCitiesOfState(formData.country, formData.state);
      setLocationData(prev => ({
        ...prev,
        cities: cities,
      }));
      setFormData(prev => ({
        ...prev,
        city: '', // Reset city
      }));
    }
  }, [formData.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadToCloudinary = async (file: File, fieldName: 'shopId'): Promise<string> => {
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    setUploadProgress(prev => ({ ...prev, [fieldName]: 'Uploading...' }));

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error('Upload failed');

      const result = await res.json();
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'Upload Approvedful!' }));
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'Upload failed!' }));
      throw error;
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [fieldName]: '' }));
      }, 3000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      try {
        // Auto-upload the selected file
        const uploadField = name as 'shopId';
        const url = await uploadToCloudinary(file, uploadField);
        
        setFormData(prev => ({ 
          ...prev, 
          shopIdUrl: url 
        }));

        const currentSession = JSON.parse(sessionStorage.getItem('sellerRegistration_step2') || '{}');
        const updated = { ...currentSession, shopIdUrl: url };
        sessionStorage.setItem('sellerRegistration_step2', JSON.stringify(updated));

      } catch (err) {
        console.error('Upload failed:', err);
        alert('File upload failed. Please try again.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent navigating if a selected file is still uploading
    if (formData.shopId && !formData.shopIdUrl) {
      alert('Please wait for the shop ID upload to finish');
      return;
    }

    // Get country, state, city names for storage
    const selectedCountry = locationData.countries.find(c => c.isoCode === formData.country);
    const selectedState = locationData.states.find(s => s.isoCode === formData.state);
    const selectedCity = locationData.cities.find(c => c.name === formData.city);

    const dataToStore = {
      shopName: formData.shopName,
      contactNumber: formData.contactNumber,
      address: formData.address,
      country: selectedCountry ? selectedCountry.name : '',
      countryCode: formData.country,
      state: selectedState ? selectedState.name : '',
      stateCode: formData.state,
      city: selectedCity ? selectedCity.name : formData.city,
      shopIdUrl: formData.shopIdUrl,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem('sellerRegistration_step2', JSON.stringify(dataToStore));
    localStorage.setItem('sellerRegistration_step2', JSON.stringify(dataToStore));
    
    router.push('/seller/auth/register/step3');
  };

  // Show loading while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have access (will be redirected)
  if (!canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-lg w-full space-y-8">
        
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-border backdrop-blur-sm">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">Step 2 of 4</span>
              <span className="text-sm text-muted-foreground">50%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              Shop Details
            </h2>
            <p className="text-muted-foreground">
              Tell us about your business
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Shop Name */}
            <div className="space-y-2">
              <label htmlFor="shopName" className="flex items-center text-sm font-medium text-card-foreground">
                <Store className="w-4 h-4 mr-2 text-primary" />
                Shop Name
              </label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Enter your shop name"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label htmlFor="contactNumber" className="flex items-center text-sm font-medium text-card-foreground">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Enter shop contact number"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center text-sm font-medium text-card-foreground border-b border-border pb-2">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Location Details</h3>
              </div>
              
              {/* Country */}
              <div className="space-y-2">
                <label htmlFor="country" className="flex items-center text-sm font-medium text-card-foreground">
                  <Globe className="w-4 h-4 mr-2 text-primary" />
                  Country
                </label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="">Select Country</option>
                    {locationData.countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label htmlFor="state" className="flex items-center text-sm font-medium text-card-foreground">
                  <Building className="w-4 h-4 mr-2 text-primary" />
                  State
                </label>
                <div className="relative">
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.country}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <option value="">Select State</option>
                    {locationData.states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label htmlFor="city" className="flex items-center text-sm font-medium text-card-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  City
                </label>
                <div className="relative">
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.state}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <option value="">Select City</option>
                    {locationData.cities.map((city, index) => (
                      <option key={`${city.name}-${index}`} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="flex items-center text-sm font-medium text-card-foreground">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                Complete Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all duration-200"
                placeholder="Enter detailed shop address with landmarks"
              />
            </div>

            {/* Shop ID (License Upload) */}
            <div className="space-y-3">
              <label htmlFor="shopId" className="flex items-center text-sm font-medium text-card-foreground">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Shop License Document
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="shopId"
                  name="shopId"
                  onChange={handleFileChange}
                  disabled={uploading.shopId}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50 transition-all duration-200"
                />
                {uploading.shopId && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Upload className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                )}
              </div>
              {uploadProgress.shopId && (
                <div className={`flex items-center text-xs mt-2 ${
                  uploadProgress.shopId.includes('Approvedful') 
                    ? 'text-green-600' 
                    : uploadProgress.shopId.includes('failed') 
                    ? 'text-destructive' 
                    : 'text-primary'
                }`}>
                  {uploadProgress.shopId.includes('Approvedful') ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : uploadProgress.shopId.includes('failed') ? (
                    <XCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1 animate-pulse" />
                  )}
                  {uploadProgress.shopId}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload shop license or registration document (PDF, DOC, or image formats)
              </p>
            </div>

            {/* Next Button */}
            <Button
              type="submit"
              disabled={uploading.shopId}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {uploading.shopId ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                'Continue to Step 3'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
