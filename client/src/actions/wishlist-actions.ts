'use server';

import { auth } from '@/lib/userauth';
import { db, wishlists, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function getWishlist(): Promise<{ success: boolean; items: string[] }> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: true, items: [] };
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return { success: true, items: [] };
    }

    // Get wishlist items
    const wishlistItems = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, user.id),
    });

    const productIds = wishlistItems.map(item => item.productId);
    
    return { success: true, items: productIds };
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return { success: false, items: [] };
  }
}

export async function addToWishlist(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, message: 'Please sign in to add to wishlist' };
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Check if product already exists in wishlist
    const existing = await db.query.wishlists.findFirst({
      where: and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, productId)
      ),
    });

    if (existing) {
      return { success: false, message: 'Product already in wishlist' };
    }

    // Add to wishlist
    await db.insert(wishlists).values({
      userId: user.id,
      productId: productId,
    });

    return { success: true, message: 'Added to wishlist' };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, message: 'Failed to add to wishlist' };
  }
}

export async function removeFromWishlist(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, message: 'Please sign in' };
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Remove from wishlist
    await db.delete(wishlists).where(
      and(
        eq(wishlists.userId, user.id),
        eq(wishlists.productId, productId)
      )
    );

    return { success: true, message: 'Removed from wishlist' };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, message: 'Failed to remove from wishlist' };
  }
}

export async function clearWishlist(): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, message: 'Please sign in' };
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Clear all wishlist items
    await db.delete(wishlists).where(eq(wishlists.userId, user.id));
    
    return { success: true, message: 'Wishlist cleared' };
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return { success: false, message: 'Failed to clear wishlist' };
  }
}
