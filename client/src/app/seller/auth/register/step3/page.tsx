"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRegistrationProtection } from '@/lib/hooks/useRegistrationProtection';

export default function Step3() {
  const router = useRouter();
  const { isLoading: checkingAccess, canAccess } = useRegistrationProtection(3);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'verified'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setSuccess(`Code sent to ${email}`);
      } else {
        setError(data.message || 'Failed to send code');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
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

      // Parse response data regardless of status
      const data = await response.json();

      if (response.ok && data.success) {
        // Success case
        const step3Data = {
          emailVerified: true,
          verifiedEmail: email,
          verifiedAt: new Date().toISOString()
        };
        sessionStorage.setItem('sellerRegistration_step3', JSON.stringify(step3Data));
        localStorage.setItem('sellerRegistration_step3', JSON.stringify(step3Data));
        
        setStep('verified');
        setSuccess('Email verified! Redirecting...');
        
        setTimeout(() => {
          router.push('/seller/auth/register/step4');
        }, 2000);
        
      } else {
        // Error case - show the actual error message from API
        setError(data.message || 'Verification failed');
        setOtp(''); // Clear wrong OTP
      }
      
    } catch (error) {
      // Only catch actual network errors
      setError('Network connection error. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToNext = () => {
    router.push('/seller/auth/register/step4');
  };

  // Show loading while checking access
  if (checkingAccess) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 3 of 4</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">75%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          {step === 'email' && 'Email Verification'}
          {step === 'otp' && 'Enter OTP Code'}
          {step === 'verified' && '✅ Verified!'}
        </h2>

        {/* Messages */}
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded text-center font-medium">
            ❌ {error}
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={sendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={verifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg tracking-widest focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                Check your email inbox and spam folder
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                disabled={isLoading}
                className="w-full text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
              >
                Change Email Address
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  sendOTP(fakeEvent);
                }}
                disabled={isLoading}
                className="w-full text-orange-600 dark:text-orange-400 text-sm hover:text-orange-700 disabled:opacity-50"
              >
                Resend OTP Code
              </button>
            </div>
          </form>
        )}

        {/* Verified Step */}
        {step === 'verified' && (
          <div className="text-center space-y-4">
            <div className="text-green-600 dark:text-green-400 text-6xl">✅</div>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300 font-medium">Email verified successfully!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verified: <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </p>
            </div>
            <Button
              onClick={goToNext}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
            >
              Continue to Next Step →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
