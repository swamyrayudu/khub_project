'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist } from '@/actions/wishlist-actions';

interface WishlistContextType {
  wishlistItems: string[];
  wishlistCount: number;
  addToWishlistState: (productId: string) => void;
  removeFromWishlistState: (productId: string) => void;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = useCallback(async () => {
    try {
      const result = await getWishlist();
      if (result.success) {
        setWishlistItems(result.items);
        setWishlistCount(result.items.length);
      }
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlistState = useCallback((productId: string) => {
    setWishlistItems((prev) => {
      if (!prev.includes(productId)) {
        const newItems = [...prev, productId];
        setWishlistCount(newItems.length);
        return newItems;
      }
      return prev;
    });
  }, []);

  const removeFromWishlistState = useCallback((productId: string) => {
    setWishlistItems((prev) => {
      const newItems = prev.filter((id) => id !== productId);
      setWishlistCount(newItems.length);
      return newItems;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlistItems.includes(productId),
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlistState,
        removeFromWishlistState,
        refreshWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
