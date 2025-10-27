"use client";

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export const useLogout = () => {
  const router = useRouter();

  const logout = async (redirectTo: string = '/seller/auth/login') => {
    try {
      // Call logout API to clear HTTP-only cookies
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        // ensure cookie is cleared on server
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Logout API failed, continuing with local cleanup');
      }

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      toast.success('Approvedfully logged out!', {
        position: "top-center",
        autoClose: 2000,
      });

      // Redirect after showing toast
      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear localStorage even if API fails
      localStorage.removeItem('authToken');
      localStorage.removeUser('userData');
      
      toast.error('Signed out (with errors)', {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    }
  };

  return { logout };
};
