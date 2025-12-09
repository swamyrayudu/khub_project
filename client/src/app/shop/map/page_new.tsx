'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MapRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products page since map functionality is disabled
    router.push('/shop/products');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">This page is no longer available.</p>
      </div>
    </div>
  );
}
