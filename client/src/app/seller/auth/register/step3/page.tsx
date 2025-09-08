"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Step3() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      // Save to localStorage or state management
      localStorage.setItem('sellerRegistration_step3', JSON.stringify({ otp }));
      router.push('/seller/auth/register/step4');
    }
  };

  const handleResendOtp = () => {
    setCountdown(30);
    setCanResend(false);
    // Here you would typically call your API to resend OTP
    console.log('Resending OTP...');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 3 of 4</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">75%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Verify your shop contact
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            We've sent a verification code to your shop contact number. Please enter it below to continue.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                required
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-center text-lg tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter 6-digit OTP"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Enter the 6-digit verification code</p>
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Resend OTP in {countdown} seconds
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={otp.length !== 6}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-8 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
