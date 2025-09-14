"use client";

import React from 'react';
import HomePageProtection from '@/components/auth/HomePageProtection';
import SellerHomeContent from '@/components/seller/SellerHomeContent';

export default function SellerHomePage() {
  return (
    <HomePageProtection>
      <SellerHomeContent />
    </HomePageProtection>
  );
}
