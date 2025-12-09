'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Menu, Moon, Sun, Shield, Search, Home, Users, Package, BarChart3, User as UserIcon, Settings, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { getUnreadContactsCount, markAllContactsAsRead } from '../../actions/notifications';
import { logoutAdmin } from '../../actions/adminAuth';

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
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Poll unread count
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    const fetchCount = async () => {
      try {
        const res = await getUnreadContactsCount();
        if (!stopped && typeof res?.total === 'number') {
          setNotifications(res.total);
        }
      } catch {}
    };

    const start = () => {
      fetchCount();
      intervalId = setInterval(fetchCount, 15000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
      } else {
        if (!intervalId) start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopped = true;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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
    }
  };

  // On bell click: mark all as read, reset count to 0, navigate to notifications
  const handleBellClick = async () => {
    try {
      // Optimistic local reset
      setNotifications(0);
      await markAllContactsAsRead();
      router.push('/admin/notificationadmin');
    } catch (e) {
      // If it failed, refetch count next poll; optionally revert
      // toast.error('Failed to mark notifications as read');
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/home', icon: Home },
    { name: 'Sellers', href: '/admin/sellers', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-accent" onClick={onMenuToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          )}

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

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sellers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border/50 focus:border-ring"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
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

          {/* Bell: mark read then go */}
          <Button variant="ghost" size="sm" className="relative hover:bg-accent" onClick={handleBellClick}>
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="relative hover:bg-accent">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-accent">
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground">{adminUser?.name || 'Admin User'}</p>
                    <p className="text-xs text-muted-foreground">{adminUser?.role || 'Administrator'}</p>
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
                  <p className="text-sm font-medium leading-none">{adminUser?.name || 'Admin User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{adminUser?.email || 'localhunt.team2@gmail.com'}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => {
                  setIsLoggingOut(true);
                  try {
                    await logoutAdmin();
                    // logoutAdmin() will redirect, so this won't execute
                  } catch (error) {
                    // logoutAdmin throws when using redirect(), treat as success
                    console.log('Admin logout completed');
                    setIsLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="md:hidden border-t border-border/40 bg-background px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) {/* do search */} }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
