"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRegistrationProtection } from '@/lib/hooks/useRegistrationProtection';
import { toast } from 'react-toastify';
import { 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function Step4() {
  const router = useRouter();
  const { isLoading: checkingAccess, canAccess } = useRegistrationProtection(4);
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
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
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const step1Data = sessionStorage.getItem('sellerRegistration_step1') || localStorage.getItem('sellerRegistration_step1');
      const step2Data = sessionStorage.getItem('sellerRegistration_step2') || localStorage.getItem('sellerRegistration_step2');
      const step3Data = sessionStorage.getItem('sellerRegistration_step3') || localStorage.getItem('sellerRegistration_step3');
      
      if (!step1Data || !step2Data || !step3Data) {
        toast.error("Missing registration data. Please complete all previous steps.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      const registrationData = {
        ...JSON.parse(step1Data),
        ...JSON.parse(step2Data),
        ...JSON.parse(step3Data),
        password: formData.password,
        completedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/auth/seller-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (result.success) {
        // Clear registration data
        ['sellerRegistration_step1', 'sellerRegistration_step2', 'sellerRegistration_step3', 'sellerRegistration_step4'].forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        // Success toast
        toast.success("🎉 Registration successful! Welcome to Localhunt!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        setTimeout(() => {
          router.push('/seller/auth/login');
        }, 2000);
        
      } else {
        toast.error(result.message || "Registration failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error("Connection error. Please check your internet and try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        
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
              <span className="text-sm font-medium text-card-foreground">Step 4 of 4</span>
              <span className="text-sm text-muted-foreground">100%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              Create Your Password
            </h2>
            <p className="text-muted-foreground">
              Almost done! Create a secure password for your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center text-sm font-medium text-card-foreground">
                <Lock className="w-4 h-4 mr-2 text-primary" />
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
                  className={`w-full px-4 py-3 pr-12 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                    errors.password ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center text-destructive text-xs mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.password}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-card-foreground">
                <CheckCircle className="w-4 h-4 mr-2 text-primary" />
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
                  className={`w-full px-4 py-3 pr-12 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                    errors.confirmPassword ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center text-destructive text-xs mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Password Strength Indicator */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-card-foreground">Password Requirements:</p>
              <div className="space-y-1">
                <div className={`flex items-center text-xs ${
                  formData.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    formData.password.length >= 8 ? 'bg-green-600' : 'bg-muted'
                  }`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center text-xs ${
                  /(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /(?=.*[a-z])/.test(formData.password) ? 'bg-green-600' : 'bg-muted'
                  }`} />
                  One lowercase letter
                </div>
                <div className={`flex items-center text-xs ${
                  /(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /(?=.*[A-Z])/.test(formData.password) ? 'bg-green-600' : 'bg-muted'
                  }`} />
                  One uppercase letter
                </div>
                <div className={`flex items-center text-xs ${
                  /(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    /(?=.*\d)/.test(formData.password) ? 'bg-green-600' : 'bg-muted'
                  }`} />
                  One number
                </div>
                <div className={`flex items-center text-xs ${
                  formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    formData.password === formData.confirmPassword && formData.confirmPassword ? 'bg-green-600' : 'bg-muted'
                  }`} />
                  Passwords match
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
