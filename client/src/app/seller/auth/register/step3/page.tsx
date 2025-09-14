"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRegistrationProtection } from '@/lib/hooks/useRegistrationProtection';
import { toast } from 'react-toastify';
import { 
  Sun, 
  Moon, 
  Mail, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  Edit
} from 'lucide-react';

export default function Step3() {
  const router = useRouter();
  const { isLoading: checkingAccess, canAccess } = useRegistrationProtection(3);
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'verified'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


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

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('otp');
        setSuccess(`Verification code sent to ${email}`);
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const step3Data = {
          emailVerified: true,
          verifiedEmail: email,
          verifiedAt: new Date().toISOString()
        };
        sessionStorage.setItem('sellerRegistration_step3', JSON.stringify(step3Data));
        localStorage.setItem('sellerRegistration_step3', JSON.stringify(step3Data));
        
        setStep('verified');
        setSuccess('Email verified successfully! Redirecting...');
        
        setTimeout(() => {
          router.push('/seller/auth/register/step4');
        }, 2000);
        
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
        setOtp('');
      }
      
    } catch (error) {
      setError('Network connection error. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToNext = () => {
    router.push('/seller/auth/register/step4');
  };

  const handleResendOTP = () => {
    setError('');
    setSuccess('');
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    sendOTP(fakeEvent);
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setSuccess('');
  };

  // Show loading while checking access
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

  // Don't render if user doesn't have access (will be redirected)
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
              <span className="text-sm font-medium text-card-foreground">Step 3 of 4</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'email' && <Mail className="w-8 h-8 text-primary" />}
              {step === 'otp' && <Shield className="w-8 h-8 text-primary" />}
              {step === 'verified' && <CheckCircle className="w-8 h-8 text-green-600" />}
            </div>
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              {step === 'email' && 'Email Verification'}
              {step === 'otp' && 'Enter Verification Code'}
              {step === 'verified' && 'Email Verified!'}
            </h2>
            <p className="text-muted-foreground">
              {step === 'email' && 'We need to verify your email address'}
              {step === 'otp' && `Code sent to ${email}`}
              {step === 'verified' && 'Your email has been successfully verified'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-center flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-center font-medium flex items-center justify-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-xs font-bold">!</div>
              <span>{error}</span>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={sendOTP} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center text-sm font-medium text-card-foreground">
                  <Mail className="w-4 h-4 mr-2 text-primary" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={verifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="flex items-center text-sm font-medium text-card-foreground">
                  <Shield className="w-4 h-4 mr-2 text-primary" />
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-center text-2xl tracking-widest font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all duration-200"
                  placeholder="000000"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Check your email inbox and spam folder for the verification code
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>

              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 w-full text-muted-foreground hover:text-card-foreground text-sm transition-colors duration-200 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>Change Email Address</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 w-full text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Code</span>
                </button>
              </div>
            </form>
          )}

          {/* Verified Step */}
          {step === 'verified' && (
            <div className="text-center space-y-6">
              <div className="bg-green-100 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-card-foreground">
                  Email Successfully Verified!
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Verified Email:</p>
                  <p className="font-semibold text-card-foreground">{email}</p>
                </div>
              </div>
              
              <Button
                onClick={goToNext}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 shadow-lg"
              >
                <span>Continue to Final Step</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
