"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  Menu,
  Store,
  Settings,
  Loader2
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserData {
  id: string;
  email: string;
  name: string;
  shopName?: string;
  role: string;
  status: string;
}

interface SellerHeaderProps {
  onMobileMenuToggle: () => void;
}

export default function SellerHeader({ onMobileMenuToggle }: SellerHeaderProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');

    if (!token || !userDataString) {
      router.push('/seller/auth/login');
      return;
    }

    try {
      const user = JSON.parse(userDataString);
      setUserData(user);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      handleLogout();
    }

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [router]);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.warn('Logout API failed, continuing with cleanup');
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      toast.success('Successfully logged out!', {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = '/seller/auth/login';
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      toast.error('Signed out (with errors)', {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = '/seller/auth/login';
      }, 1000);
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!userData) {
    return null; // Or a loading skeleton
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 rounded-lg hover:bg-accent lg:hidden mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-2 rounded-lg">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-card-foreground">
                  {userData.shopName || 'Seller Dashboard'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Status: <span className="capitalize font-medium">{userData.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-card-foreground">{userData.name}</p>
                    <p className="text-xs text-muted-foreground">{userData.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => router.push('/seller/profile')}
                  className="cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
