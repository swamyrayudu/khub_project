"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRegistrationProtection} from '@/lib/hooks/useRegistrationProtection';

export default function Step4() {
  const router = useRouter();
  const { isLoading, canAccess } = useRegistrationProtection(4);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Collect all registration data from sessionStorage first, then localStorage
        const step1Data = sessionStorage.getItem('sellerRegistration_step1') || localStorage.getItem('sellerRegistration_step1');
        const step2Data = sessionStorage.getItem('sellerRegistration_step2') || localStorage.getItem('sellerRegistration_step2');
        const step3Data = sessionStorage.getItem('sellerRegistration_step3') || localStorage.getItem('sellerRegistration_step3');
        
        if (!step1Data || !step2Data || !step3Data) {
          alert('Missing registration data. Please complete all previous steps.');
          return;
        }

        const registrationData = {
          ...JSON.parse(step1Data),
          ...JSON.parse(step2Data),
          ...JSON.parse(step3Data),
          password: formData.password,
        };

        // Submit to API
        const response = await fetch('/api/auth/seller-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const result = await response.json();

        if (result.success) {
          // Clear all registration data from localStorage
          localStorage.removeItem('sellerRegistration_step1');
          localStorage.removeItem('sellerRegistration_step2');
          localStorage.removeItem('sellerRegistration_step3');
          localStorage.removeItem('sellerRegistration_step4');
          localStorage.removeItem('sellerRegistration_complete');
          
          // Show success message
          alert('Registration completed successfully! You can now login.');
          
          // Redirect to login page
          router.push('/seller/auth/login');
        } else {
          alert(result.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        alert('Registration failed. Please check your connection and try again.');
      }
    }
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 4 of 4</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">100%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Create your password
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    {showPassword ? 'Hide' : 'Show'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Register
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
