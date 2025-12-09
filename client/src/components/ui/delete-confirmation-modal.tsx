"use client";

import React from 'react';
import { Button } from "./button";
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isLoading = false
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-destructive/10 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Delete Product
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>&quot;{productName}&quot;</strong>? 
          This action cannot be undone and will permanently remove the product 
          from your inventory.
        </p>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Delete Product
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
