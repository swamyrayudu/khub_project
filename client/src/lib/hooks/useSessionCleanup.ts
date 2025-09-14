"use client";

import { useEffect } from 'react';

export const useSessionCleanup = () => {
  useEffect(() => {
    // Function to clear registration data
    const clearRegistrationData = () => {
      localStorage.removeItem('sellerRegistration_step1');
      localStorage.removeItem('sellerRegistration_step2');
      localStorage.removeItem('sellerRegistration_step3');
      localStorage.removeItem('sellerRegistration_step4');
      localStorage.removeItem('sellerRegistration_complete');
      
      sessionStorage.removeItem('sellerRegistration_step1');
      sessionStorage.removeItem('sellerRegistration_step2');
      sessionStorage.removeItem('sellerRegistration_step3');
      sessionStorage.removeItem('sellerRegistration_step4');
      sessionStorage.removeItem('sellerRegistration_complete');
    };

    // Only clear data when tab is actually closed (beforeunload)
    const handleBeforeUnload = () => {
      clearRegistrationData();
    };

    // Add event listener for tab close
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
