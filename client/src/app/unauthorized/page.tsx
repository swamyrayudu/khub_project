"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, ArrowLeft, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        
        {/* Icon */}
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        
        {/* Content */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground leading-relaxed text-lg mb-6">
            You don't have the required permissions to access this area. 
            This section is restricted based on user roles.
          </p>
        </div>

        {/* Role Info */}
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">Role-Based Access Control</span>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span><strong>Admin users:</strong> Can only access admin routes (/admin/*)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-500" />
              <span><strong>Seller users:</strong> Can only access seller routes (/seller/*)</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span><strong>Cross-role access:</strong> Strictly prohibited for security</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home Page
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
