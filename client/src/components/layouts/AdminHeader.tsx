"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Sun,
  Moon,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Shield,
  BarChart3,
  Users,
  Package,
  Home,
  ChevronDown,
  Loader2
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminHeaderProps {
  adminUser?: AdminUser | null;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export default function AdminHeader({ 
  adminUser, 
  onMenuToggle, 
  showMenuButton = true 
}: AdminHeaderProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications] = useState(3);

  useEffect(() => {
    initializeTheme();
  }, []);

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
      toast.success('Switched to light mode', { autoClose: 2000 });
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
      toast.success('Switched to dark mode', { autoClose: 2000 });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`, { autoClose: 3000 });
      console.log('Search query:', searchQuery);
    }
  };
const handleLogout = async () => {
  setIsLoggingOut(true);
  
  try {
    console.log('🔓 Starting logout process...');
    
    // Call logout API
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Logout response:', data);

    if (data.success) {
      // Clear any client-side data
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminToken');
      
      // Show success toast
      toast.success('Successfully logged out!', { 
        position: "top-center",
        autoClose: 2000 
      });

      console.log('✅ Logout successful, redirecting...');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/admin/login'; // Force full page reload to clear state
      }, 1500);

    } else {
      throw new Error(data.message || 'Logout failed');
    }

  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Clear client data anyway for security
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminToken');
    
    // Show error but still redirect
    toast.error('Logout completed with errors', { 
      position: "top-center",
      autoClose: 3000 
    });
    
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
    
  } finally {
    setIsLoggingOut(false);
  }
};

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/home', icon: Home },
    { name: 'Sellers', href: '/admin/sellers', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-accent"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-sm">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Localhunt Management</p>
            </div>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sellers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border/50 focus:border-ring"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          {/* Quick Navigation (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 mr-4">
            {navigationItems.slice(0, 3).map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden xl:inline">{item.name}</span>
              </Button>
            ))}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative hover:bg-accent">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="relative hover:bg-accent"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-accent">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground">
                      {adminUser?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {adminUser?.role || 'Administrator'}
                    </p>
                  </div>
                  
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
                    {getInitials(adminUser?.name || 'Admin User')}
                  </div>
                  
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {adminUser?.name || 'Admin User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {adminUser?.email || 'localhunt.team2@gmail.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t border-border/40 bg-background px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border/50"
          />
        </form>
      </div>
    </header>
  );
}
