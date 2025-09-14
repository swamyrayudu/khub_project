"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Store,
  Activity,
  Calendar,
  Eye,
  Loader2
} from 'lucide-react';

// ✅ Add shadcn dropdown imports
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

export default function SellerHomeContent() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // ✅ Enhanced logout function
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

      // ✅ Use window.location.href for reliable redirect
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

  const handleNavigation = (path: string) => {
    setSidebarOpen(false);
    router.push(path);
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/seller/home', icon: Home, current: true },
    { name: 'Products', href: '/seller/products', icon: Package, current: false },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart, current: false },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3, current: false },
    { name: 'Customers', href: '/seller/customers', icon: Users, current: false },
    { name: 'Settings', href: '/seller/settings', icon: Settings, current: false },
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add new products to your inventory and start selling',
      icon: Plus,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      href: '/seller/products/add'
    },
    {
      title: 'View Analytics',
      description: 'Track your sales performance and customer insights',
      icon: BarChart3,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
      href: '/seller/analytics'
    },
    {
      title: 'Manage Orders',
      description: 'Process orders and manage your fulfillment',
      icon: ShoppingCart,
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
      href: '/seller/orders'
    },
    {
      title: 'Customer Support',
      description: 'Respond to customer queries and reviews',
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
      href: '/seller/support'
    },
    {
      title: 'Store Settings',
      description: 'Update your store information and preferences',
      icon: Store,
      color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600',
      href: '/seller/store/settings'
    },
    {
      title: 'Performance',
      description: 'Monitor your store performance metrics',
      icon: Activity,
      color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
      href: '/seller/performance'
    }
  ];

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
          
          {/* Logout button in mobile sidebar */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 mr-3" />
            )}
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </nav>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
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

              {/* ✅ shadcn Dropdown Menu (replaces custom dropdown) */}
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
                    onClick={() => handleNavigation('/seller/profile')}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 rounded-2xl p-6 mb-8 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-2">
                  Welcome back, {userData.name}! 🎉
                </h2>
                <p className="text-muted-foreground">
                  Ready to manage your store and grow your business today.
                </p>
                <div className="flex items-center mt-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-primary/10 p-4 rounded-xl">
                  <TrendingUp className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-card-foreground">₹0</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0% from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold text-card-foreground">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Active listings</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold text-card-foreground">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending: 0</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold text-card-foreground">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Total customers</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(action.href)}
                  className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 ${action.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                        {action.title}
                      </h4>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Recent Activity</h3>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                View All
              </button>
            </div>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start by adding your first product to see activity here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
