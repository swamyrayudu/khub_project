'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, ArrowRight, Star, Users, Shield, Moon, Sun } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved theme preference or default to light mode
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 transition-colors duration-300">
      
      {/* Header with Theme Toggle */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
        
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Localhunt
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your ultimate marketplace connecting amazing products with passionate sellers
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Shop Section */}
          <div className="group bg-card rounded-3xl shadow-lg hover:shadow-xl border border-border transition-all duration-300 transform hover:-translate-y-2 p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-primary/80 to-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ShoppingBag className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-card-foreground mb-4">
                Discover Amazing Products
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Browse thousands of products from trusted sellers. Find exactly what you&apos;re looking for with our easy-to-use shopping experience.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-primary/10">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <span className="text-card-foreground">Top-rated products</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-primary/10">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-card-foreground">Secure payments</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-card-foreground">Trusted sellers</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/shop/products')}
              className="w-full bg-primary text-primary-foreground py-4 px-8 rounded-2xl font-semibold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Seller Section */}
          <div className="group bg-card rounded-3xl shadow-lg hover:shadow-xl border border-border transition-all duration-300 transform hover:-translate-y-2 p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-secondary/80 to-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Store className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-card-foreground mb-4">
                Become a Seller
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Join thousands of Approvedful sellers and start your business journey. Easy setup, powerful tools, and dedicated support.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-secondary/10">
                  <Star className="w-4 h-4 text-secondary-foreground" />
                </div>
                <span className="text-card-foreground">Easy store setup</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-secondary/10">
                  <Shield className="w-4 h-4 text-secondary-foreground" />
                </div>
                <span className="text-card-foreground">Secure transactions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-secondary/10">
                  <Users className="w-4 h-4 text-secondary-foreground" />
                </div>
                <span className="text-card-foreground">24/7 support</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/seller/auth/login')}
              className="w-full bg-secondary text-secondary-foreground py-4 px-8 rounded-2xl font-semibold text-lg hover:bg-secondary/90 transition-all duration-300 flex items-center justify-center space-x-2 group shadow-lg"
            >
              <span>Register as Seller</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-card border border-border rounded-3xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-card-foreground mb-8">
            Join Our Growing Community
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
              <div className="text-3xl font-bold text-secondary-foreground mb-2">5K+</div>
              <div className="text-muted-foreground">Active Sellers</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
              <div className="text-3xl font-bold text-accent-foreground mb-2">50K+</div>
              <div className="text-muted-foreground">Products Available</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 mt-20 border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-foreground mb-4">Localhunt</h4>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Connecting buyers and sellers in a seamless, secure, and enjoyable marketplace experience.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Privacy Policy</button>
              <button className="hover:text-foreground transition-colors">Terms of Service</button>
              <button className="hover:text-foreground transition-colors">Support</button>
            </div>
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-muted-foreground">
                &copy; 2025 Localhunt. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
