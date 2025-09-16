"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  X,
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Users,
  LogOut,
  Loader2
} from 'lucide-react';

interface SellerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function SellerSidebar({ isOpen, onClose, onLogout, isLoggingOut }: SellerSidebarProps) {
  const router = useRouter();

  const navigationItems = [
    { name: 'Dashboard', href: '/seller/home', icon: Home, current: true },
    { name: 'Products', href: '/seller/products', icon: Package, current: false },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart, current: false },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3, current: false },
    { name: 'Customers', href: '/seller/customers', icon: Users, current: false },
    { name: 'Settings', href: '/seller/settings', icon: Settings, current: false },
  ];

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar for mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Menu</h2>
          <button
            onClick={onClose}
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
            onClick={onLogout}
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
    </>
  );
}
