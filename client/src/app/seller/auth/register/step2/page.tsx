"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Country, State, City } from 'country-state-city';
import { useRegistrationProtection } from '@/lib/hooks/useRegistrationProtection';

export default function Step2() {
  const router = useRouter();
  const { isLoading, canAccess } = useRegistrationProtection(2);
  const [formData, setFormData] = useState({
    shopName: '',
    contactNumber: '',
    address: '',
    country: '',
    state: '',
    city: '',
    shopId: null as File | null,
    shopIdUrl: '',
  });

  const [locationData, setLocationData] = useState({
    countries: [] as any[],
    states: [] as any[],
    cities: [] as any[],
  });

  const [uploading, setUploading] = useState<{ shopId: boolean }>({ shopId: false });
  const [uploadProgress, setUploadProgress] = useState<{ shopId: string }>({ shopId: '' });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Auto-upload the selected file like step1
      const uploadField = name as 'shopId';
      uploadToCloudinary(file, uploadField)
        .then((url) => {
          setFormData(prev => ({ ...prev, shopIdUrl: url }));
          const currentSession = JSON.parse(sessionStorage.getItem('sellerRegistration_step2') || '{}');
          const updated = { ...currentSession, shopIdUrl: url };
          sessionStorage.setItem('sellerRegistration_step2', JSON.stringify(updated));
        })
        .catch((err) => {
          console.error('Upload failed:', err);
          alert('File upload failed. Please try again.');
        });
    }
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
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'Upload successful!' }));
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have access (will be redirected)
  if (!canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 2 of 4</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">50%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Shop Details
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter shop name"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter shop contact number"
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                Location
              </h3>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select Country</option>
                    {locationData.countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  >
                    <option value="">Select State</option>
                    {locationData.states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {locationData.cities.map((city, index) => (
                      <option key={`${city.name}-${index}`} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder="Enter detailed shop address"
              />
            </div>

            {/* Shop ID (License Upload) */}
            <div>
              <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop ID (License Upload)
              </label>
              <input
                type="file"
                id="shopId"
                name="shopId"
                onChange={handleFileChange}
                disabled={uploading.shopId}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-900/20 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/30"
              />
              {uploadProgress.shopId && (
                <p className={`text-xs mt-1 ${uploadProgress.shopId.includes('successful') ? 'text-green-600' : uploadProgress.shopId.includes('failed') ? 'text-red-600' : 'text-blue-600'}`}>
                  {uploadProgress.shopId}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload shop license or registration document (PDF, DOC, or image)</p>
            </div>

            {/* Next Button */}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Next
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
