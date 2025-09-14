"use client";

import React from 'react';
import RouteProtection from '@/components/auth/RouteProtection';
import SellerHomeContent from '@/components/seller/SellerHomeContent';

export default function SellerHomePage() {
  return (
    <RouteProtection requireAuth={true}>
      <SellerHomeContent />
    </RouteProtection>
  );
}
