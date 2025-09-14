"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  DollarSign
} from 'lucide-react';

export default function SellerHome() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');

    if (!token || !userDataString) {
      router.push('/seller/auth/login');
      return;
    }

    const user = JSON.parse(userDataString);
    setUserData(user);
  }, [router]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-card-foreground">
                {userData.shopName || 'Seller Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-accent">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-accent">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="text-sm">
                <p className="font-medium text-card-foreground">{userData.name}</p>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              Welcome back, {userData.name}! 🎉
            </h2>
            <p className="text-muted-foreground">
              Ready to manage your store and grow your business today.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-card-foreground">₹0</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold text-card-foreground">0</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold text-card-foreground">0</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold text-card-foreground">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-card-foreground">Add Product</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Add new products to your inventory and start selling
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-card-foreground">View Analytics</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Track your sales performance and customer insights
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-card-foreground">Manage Orders</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Process orders and manage your fulfillment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
