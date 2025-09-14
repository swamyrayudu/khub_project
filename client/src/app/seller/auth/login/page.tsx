"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Sun, Moon, Mail, Lock, ArrowRight, Home, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      console.log('Attempting login for:', formData.email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log('Response status:', response.status);

      // Parse the response
      const data = await response.json();
      console.log('Response data:', data);

      // Handle unsuccessful response
      if (!response.ok || !data.success) {
        const errorMessage = data.message || 'Login failed. Please check your credentials.';
        
        // Set error state for UI display
        setError(errorMessage);
        
        // Show toast notification
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        return; // Exit early on error
      }

      // Success - clear any existing errors
      setError('');
      
      // Store authentication data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // Success toast
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`, {
        position: "top-center",
        autoClose: 3000,
      });

      // Redirect based on status
      if (data.status === 'pending') {
        setTimeout(() => {
          router.push('/seller/auth/login/wait');
        }, 1500);
        return;
      }

      if (data.status === 'success') {
        setTimeout(() => {
          router.push('/seller/home');
        }, 1500);
        return;
      }

      if (data.status === 'approved' || data.status === 'active') {
        setTimeout(() => {
          router.push('/seller/dashboard');
        }, 1500);
        return;
      }

      // Default redirect
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (networkError: any) {
      console.error('Network/Parse error:', networkError);
      
      const errorMessage = 'Connection error. Please check your internet connection and try again.';
      
      // Set error state for UI display
      setError(errorMessage);
      
      // Show toast notification
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      
      {/* Header with Theme Toggle and Home Button */}
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">Back to Home</span>
        </button>
        
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8 backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your Localhunt account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-card-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 disabled:opacity-50 ${
                  error ? 'border-destructive focus:ring-destructive focus:border-destructive' : 'border-border'
                }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-card-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className={`w-full pl-10 pr-12 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 disabled:opacity-50 ${
                  error ? 'border-destructive focus:ring-destructive focus:border-destructive' : 'border-border'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message - This will show inline errors */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={isLoading}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 disabled:opacity-50"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <button
              type="button"
              disabled={isLoading}
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/seller/auth/register/step1')}
              disabled={isLoading}
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Sign up as Seller
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; 2025 ShopEasy. All rights reserved.</p>
      </div>
    </div>
  );
}
