'use client';

// Example: src/app/shop/layout.tsx

import React from 'react';
import ShopHeader from "@/components/layouts/header";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { LocationModal } from "@/components/ui/location-modal";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ShopLayout({ children } :{children:React.ReactNode}) {
  const { data: session, status } = useSession();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkProfileStatus() {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        setIsCheckingProfile(false);
        return;
      }

      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch('/api/user/profile-status');
          if (response.ok) {
            const data = await response.json();
            setShowLocationModal(!data.hasCompletedProfile);
          }
        } catch (error) {
          console.error('Error checking profile status:', error);
        } finally {
          setIsCheckingProfile(false);
        }
      }
    }

    checkProfileStatus();
  }, [status, session]);

  const handleLocationSet = () => {
    setShowLocationModal(false);
    // Optionally reload the page to refresh session data
    window.location.reload();
  };

  return (
    <WishlistProvider>
      <ShopHeader/>
      {children}
      {!isCheckingProfile && (
        <LocationModal open={showLocationModal} onLocationSet={handleLocationSet} />
      )}
    </WishlistProvider>
  )
}