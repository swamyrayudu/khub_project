"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Clock,
  RefreshCw,
  Home,
  Mail,
  Phone,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

export default function WaitingPageContent() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add loading state

  // ✅ Complete useEffect implementation
  useEffect(() => {
    // Theme management
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('userData');
      }
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

  // ✅ Enhanced logout function that actually works
  const logout = async (redirectTo: string = "/seller/auth/login") => {
    setIsLoggingOut(true);
    
    try {
      // Call logout API to clear HTTP-only cookies
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        // ensure cookie is cleared on server
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Logout API failed, continuing with cleanup');
      }

    } catch (error) {
      console.error("Logout API error:", error);
    }

    // Always clear localStorage regardless of API success
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    toast.success("Approvedfully logged out!", {
      position: "top-center",
      autoClose: 2000,
    });

    // ✅ Use window.location.href for reliable redirect (fixes the main issue)
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 1000);
  };

  const checkAccountStatus = async () => {
    setIsChecking(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        await logout();
        return;
      }

      const response = await fetch('/api/auth/check-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'success' || data.status === 'active' || data.status === 'success') {
        toast.success('🎉 Your account has been success! Redirecting to dashboard...', {
          position: "top-center",
          autoClose: 3000,
        });
        
        // Update user data in localStorage
        const updatedUser = { ...userData, status: data.status };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        setTimeout(() => {
          router.push('/seller/home');
        }, 2000);
        
      } else if (data.status === 'rejected') {
        toast.error('Your application has been rejected. Please contact support for more information.', {
          position: "top-center",
          autoClose: 5000,
        });
        
        setTimeout(() => {
           logout();
        }, 3000);
        
      } else {
        toast.info('Your application is still under review. Please check back later.', {
          position: "top-center",
          autoClose: 3000,
        });
      }

    } catch (error) {
      console.error("Error checking status:", error);
      toast.error("Error checking status. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout("/seller/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Header with Theme Toggle and Home Button */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">Back to Home</span>
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Main Waiting Card */}
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-xl border border-border p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            Account Under Review
          </h1>
          <p className="text-muted-foreground text-lg">
            Your seller application is being processed
          </p>
        </div>

        {/* Status Info */}
        <div className="bg-muted/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            What happens next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-foreground text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-card-foreground">Document Verification</p>
                <p className="text-sm text-muted-foreground">We're reviewing your submitted documents</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-muted border-2 border-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Admin Approval</p>
                <p className="text-sm text-muted-foreground">Final approval from our admin team</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-muted border-2 border-border rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-muted-foreground text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Account Activation</p>
                <p className="text-sm text-muted-foreground">Access to your seller dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        {userData && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-card-foreground mb-2">Application Details</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {userData.email}
            </p>
            {userData.name && (
              <p className="text-sm text-muted-foreground">
                <strong>Name:</strong> {userData.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong>{" "}
              <span className="text-yellow-600 font-medium capitalize">
                {userData.status}
              </span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={checkAccountStatus}
            disabled={isChecking}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Check Status</span>
              </>
            )}
          </button>

          {/* ✅ Enhanced logout button with loading state */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full cursor-pointer bg-destructive/10 text-destructive border border-destructive/20 py-3 px-6 rounded-xl font-medium hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 cursor-pointer" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Contact our support team:
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="mailto:support@Localhunt.com"
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; 2025 Localhunt. All rights reserved.</p>
      </div>
    </div>
  );
}
