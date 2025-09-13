'use client';

import React from 'react';

const LocalHuntForShopkeepers = () => {
  const handleLogin = () => {
    alert('Login button clicked! Redirect to login page.');
  };
  
  const handleSignup = () => {
    alert('Sign Up button clicked! Redirect to registration page.');
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header Section */}
      <header className="bg-background shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <i className="fas fa-store text-2xl text-primary"></i>
              <span className="text-2xl font-bold text-primary">Local Hunt</span>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleLogin}
                className="px-4 py-2 rounded-md font-semibold border-2 border-primary text-primary 
                         hover:bg-primary hover:text-primary-foreground transition-all duration-300 
                         transform hover:-translate-y-1 shadow-md hover:shadow-lg"
              >
                Login
              </button>
              <button 
                onClick={handleSignup}
                className="px-4 py-2 rounded-md font-semibold bg-primary text-primary-foreground 
                         hover:bg-primary/90 transition-all duration-300 
                         transform hover:-translate-y-1 shadow-md hover:shadow-lg"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="py-12 md:py-20"
        style={{
          background: "linear-gradient(rgba(240, 244, 255, 0.9), rgba(230, 230, 255, 0.9)), url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"%3E%3Cg fill=\"none\" stroke=\"%234f46e5\" stroke-width=\"0.5\" stroke-opacity=\"0.1\"%3E%3Cpath d=\"M 0 0 L 60 60 M 60 0 L 0 60\"/%3E%3C/g%3E%3C/svg%3E')",
          backgroundSize: 'cover'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">Welcome to Local Hunt</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Local Hunt is a platform that connects shoppers with local stores. We help customers discover products available in physical stores near them, check prices, and see availability before visiting.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            For shopkeepers, it's an opportunity to increase foot traffic and showcase your products to a wider audience.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8 md:mb-12">What Shopkeepers Can Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature Card 1 */}
            <div className="bg-background rounded-xl p-6 text-center shadow-md 
                         hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                         border border-border hover:border-primary">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-store"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Register Your Shop</h3>
              <p className="text-muted-foreground">Create a profile for your store with details like location, opening hours, and contact information.</p>
            </div>
            
            {/* Feature Card 2 */}
            <div className="bg-background rounded-xl p-6 text-center shadow-md 
                         hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                         border border-border hover:border-primary">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-box-open"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">List Your Products</h3>
              <p className="text-muted-foreground">Showcase your products with images, descriptions, and prices so customers know what you offer.</p>
            </div>
            
            {/* Feature Card 3 */}
            <div className="bg-background rounded-xl p-6 text-center shadow-md 
                         hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                         border border-border hover:border-primary">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Update Availability</h3>
              <p className="text-muted-foreground">Easily mark items as in-stock or out-of-stock to keep customers informed in real-time.</p>
            </div>
            
            {/* Feature Card 4 */}
            <div className="bg-background rounded-xl p-6 text-center shadow-md 
                         hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                         border border-border hover:border-primary">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Get Discovered</h3>
              <p className="text-muted-foreground">Appear in local search results when customers look for products you carry in your area.</p>
            </div>
            
            {/* Feature Card 5 */}
            <div className="bg-background rounded-xl p-6 text-center shadow-md 
                         hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                         border border-border hover:border-primary">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Track Performance</h3>
              <p className="text-muted-foreground">See how many people are viewing your products and get insights to improve your listings.</p>
            </div>
            
            {/* Feature Card 6 */}
            <div className="bg-background rounded-xl p-6 text-center shadow-md 
                         hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2
                         border border-border hover:border-primary">
              <div className="text-4xl text-primary mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Connect with Customers</h3>
              <p className="text-muted-foreground">Build relationships with local shoppers and turn them into regular customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join hundreds of local shopkeepers who are already growing their business with Local Hunt.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleLogin}
              className="px-6 py-3 rounded-lg font-semibold border-2 border-primary text-primary 
                       hover:bg-primary hover:text-primary-foreground transition-all duration-300 
                       transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            >
              Login to Your Account
            </button>
            <button 
              onClick={handleSignup}
              className="px-6 py-3 rounded-lg font-semibold bg-primary text-primary-foreground 
                       hover:bg-primary/90 transition-all duration-300 
                       transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </section>

      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

export default LocalHuntForShopkeepers;