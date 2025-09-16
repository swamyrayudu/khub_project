"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Store,
  Activity,
  Calendar,
  Eye
} from 'lucide-react';

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
      router.push('/seller/auth/login');
    }
  }, [router]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
    </div>
  );
}
