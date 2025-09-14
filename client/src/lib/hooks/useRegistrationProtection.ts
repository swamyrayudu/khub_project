"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionCleanup } from './useSessionCleanup';

interface RegistrationStep {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
}

export const useRegistrationProtection = (currentStep: number) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  
  // Use session cleanup hook
  useSessionCleanup();

  useEffect(() => {
    const checkStepAccess = () => {
      try {
        // Get data from sessionStorage first (primary), then localStorage (backup)
        const step1Data = sessionStorage.getItem('sellerRegistration_step1') || localStorage.getItem('sellerRegistration_step1');
        const step2Data = sessionStorage.getItem('sellerRegistration_step2') || localStorage.getItem('sellerRegistration_step2');
        const step3Data = sessionStorage.getItem('sellerRegistration_step3') || localStorage.getItem('sellerRegistration_step3');
        const step4Data = sessionStorage.getItem('sellerRegistration_step4') || localStorage.getItem('sellerRegistration_step4');

        const completedSteps: RegistrationStep = {
          step1: !!step1Data,
          step2: !!step2Data,
          step3: !!step3Data,
          step4: !!step4Data,
        };

        // Determine the current progress level
        let currentProgress = 0;
        if (completedSteps.step1) currentProgress = 1;
        if (completedSteps.step2) currentProgress = 2;
        if (completedSteps.step3) currentProgress = 3;
        if (completedSteps.step4) currentProgress = 4;


        let hasAccess = false;

        switch (currentStep) {
          case 1:
            // Step 1: Can access if no progress (0) or if only step 1 is completed (1)
            hasAccess = currentProgress === 0 || currentProgress === 1;
            break;
          case 2:
            // Step 2: Can access if step 1 is completed (progress >= 1) and step 2 is not completed (progress < 2)
            hasAccess = currentProgress >= 1 && currentProgress < 2;
            break;
          case 3:
            // Step 3: Can access if step 2 is completed (progress >= 2) and step 3 is not completed (progress < 3)
            hasAccess = currentProgress >= 2 && currentProgress < 3;
            break;
          case 4:
            // Step 4: Can access if step 3 is completed (progress >= 3) and step 4 is not completed (progress < 4)
            hasAccess = currentProgress >= 3 && currentProgress < 4;
            break;
          default:
            hasAccess = false;
        }

        if (!hasAccess) {
          // Redirect to appropriate step based on current progress
          switch (currentProgress) {
            case 0:
              router.replace('/seller/auth/register/step1');
              break;
            case 1:
              router.replace('/seller/auth/register/step2');
              break;
            case 2:
              router.replace('/seller/auth/register/step3');
              break;
            case 3:
              router.replace('/seller/auth/register/step4');
              break;
            case 4:
              // Registration completed, redirect to login
              router.replace('/seller/auth/login');
              break;
            default:
              router.replace('/seller/auth/register/step1');
          }
        } else {
          setCanAccess(true);
        }
      } catch (error) {
        // On error, redirect to step 1
        router.replace('/seller/auth/register/step1');
      } finally {
        setIsLoading(false);
      }
    };

    checkStepAccess();
  }, [currentStep, router]);

  return { isLoading, canAccess };
};
