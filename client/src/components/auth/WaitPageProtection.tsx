"use client";

import React from 'react';
import RouteProtection from '@/components/auth/RouteProtection';

interface UserData {
  status?: string;
  [key: string]: unknown;
}

interface WaitPageProtectionProps {
  children: React.ReactNode;
}

export default function WaitPageProtection({ children }: WaitPageProtectionProps) {
  return (
    <RouteProtection 
      requireAuth={true}
      redirectTo="/seller/home"
      customCheck={(userData: UserData | null) => {
        console.log('Wait page protection check - user status:', userData?.status);
        
        // ✅ Only allow users with pending status
        return userData?.status === 'pending';
      }}
    >
      {children}
    </RouteProtection>
  );
}
