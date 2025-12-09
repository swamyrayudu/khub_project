"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface UserData {
  [key: string]: unknown;
}

interface RouteProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectIfAuth?: boolean;
  redirectTo?: string;
  customCheck?: (userData: UserData | null) => boolean;
}

export default function RouteProtection({ 
  children, 
  requireAuth = false, 
  redirectIfAuth = false,
  redirectTo,
  customCheck
}: RouteProtectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userDataString = localStorage.getItem('userData');
      
      const authenticated = !!(token && userDataString);
      let userData: UserData | null = null;

      if (userDataString) {
        userData = JSON.parse(userDataString);
      }

      // Handle protected routes (require auth)
      if (requireAuth && !authenticated) {
        const loginUrl = `/seller/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
        return;
      }

      // Handle auth routes (redirect if already authenticated)
      if (redirectIfAuth && authenticated) {
        const destination = redirectTo || '/seller/home';
        router.replace(destination);
        return;
      }

      // ✅ Handle custom check (for status-based protection)
      if (customCheck && authenticated) {
        const passesCustomCheck = customCheck(userData);
        if (!passesCustomCheck) {
          const destination = redirectTo || '/seller/home';
          console.log(`Custom check failed, redirecting to: ${destination}`);
          router.replace(destination);
          return;
        }
      }

    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      if (requireAuth) {
        router.replace('/seller/auth/login');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
