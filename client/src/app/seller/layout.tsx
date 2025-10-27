"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import SellerHeader from '@/components/seller/SellerHeader';
import SellerSidebar from '@/components/seller/SellerSidebar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Define routes where header should NOT be shown
  const noHeaderRoutes = [
    '/seller/auth/login',
    '/seller/auth/login/wait',
    '/seller/auth/register/step1',
    '/seller/auth/register/step2',
    '/seller/auth/register/step3',
    '/seller/auth/register/step4'
  ];

  // Check if current route should show header
  const showHeader = !noHeaderRoutes.some(route => pathname.startsWith(route));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        // ensure cookie is cleared on server
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      setTimeout(() => {
        window.location.href = '/seller/auth/login';
      }, 1000);

    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      setTimeout(() => {
        window.location.href = '/seller/auth/login';
      }, 1000);
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Conditionally render header and sidebar */}
      {showHeader && (
        <>
          <SellerHeader onMobileMenuToggle={() => setSidebarOpen(true)} />
          <SellerSidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </>
      )}
      
      {/* Main content */}
      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
}
