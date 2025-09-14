

"use client";

import React from 'react';
import RouteProtection from '@/components/auth/RouteProtection';

interface HomePageProtectionProps {
  children: React.ReactNode;
}

export default function HomePageProtection({ children }: HomePageProtectionProps) {
  return (
    <RouteProtection 
      requireAuth={true}
      redirectTo="/seller/auth/login/wait"
      customCheck={(userData: any) => {
        console.log('Home page protection check - user status:', userData?.status);
        
        // ✅ CRITICAL: Only allow success/approved/active users
        if (['success', 'approved', 'active'].includes(userData?.status)) {
          return true;
        }
        
        // ✅ CRITICAL: Pending users must go to wait page
        if (userData?.status === 'pending') {
          console.log('❌ Pending user blocked from home page');
          return false;
        }
        
        // Default: block access
        return false;
      }}
    >
      {children}
    </RouteProtection>
  );
}
