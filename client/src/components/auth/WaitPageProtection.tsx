"use client";

import React from 'react';
import RouteProtection from '@/components/auth/RouteProtection';

interface WaitPageProtectionProps {
  children: React.ReactNode;
}

export default function WaitPageProtection({ children }: WaitPageProtectionProps) {
  return (
    <RouteProtection 
      requireAuth={true}
      redirectTo="/seller/home"
      customCheck={(userData: any) => {
        // Only allow users with pending status
        console.log('Checking user status:', userData?.status);
        return userData?.status === 'pending';
      }}
    >
      {children}
    </RouteProtection>
  );
}
