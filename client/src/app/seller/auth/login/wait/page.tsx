"use client";

import React from 'react';
import WaitPageProtection from '@/components/auth/WaitPageProtection';
import WaitingPageContent from '@/components/seller/WaitingPageContent';

export default function WaitingPage() {
  return (
    <WaitPageProtection>
      <WaitingPageContent />
    </WaitPageProtection>
  );
}
