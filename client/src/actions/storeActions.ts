'use server';

import { db } from '@/lib/db';
import { sellers, products } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

// Get all stores (removed status filter to show all sellers)
export async function getAllStores() {
  try {
    const stores = await db
      .select({
        id: sellers.id,
        shopName: sellers.shopName,
        shopOwnerName: sellers.shopOwnerName,
        shopContactNumber: sellers.shopContactNumber,
        address: sellers.address,
        city: sellers.city,
        state: sellers.state,
        country: sellers.country,
        email: sellers.email,
        status: sellers.status,
        createdAt: sellers.createdAt,
      })
      .from(sellers);

    return { success: true, stores };
  } catch (error) {
    console.error('Error fetching stores:', error);
    return { success: false, stores: [] };
  }
}

// Get store details by ID
export async function getStoreById(storeId: string) {
  try {
    const [store] = await db
      .select({
        id: sellers.id,
        shopName: sellers.shopName,
        shopOwnerName: sellers.shopOwnerName,
        contact: sellers.contact,
        gender: sellers.gender,
        shopContactNumber: sellers.shopContactNumber,
        address: sellers.address,
        city: sellers.city,
        state: sellers.state,
        country: sellers.country,
        email: sellers.email,
        emailVerified: sellers.emailVerified,
        status: sellers.status,
        createdAt: sellers.createdAt,
        updatedAt: sellers.updatedAt,
      })
      .from(sellers)
      .where(eq(sellers.id, storeId))
      .limit(1);

    if (!store) {
      return { success: false, store: null, message: 'Store not found' };
    }

    // Get product count for this store
    const [productStats] = await db
      .select({
        totalProducts: count(),
      })
      .from(products)
      .where(eq(products.sellerId, storeId));

    // Get store's products
    const storeProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        offerPrice: products.offerPrice,
        quantity: products.quantity,
        category: products.category,
        brand: products.brand,
        images: products.images,
        status: products.status,
      })
      .from(products)
      .where(eq(products.sellerId, storeId))
      .limit(12);

    return {
      success: true,
      store: {
        ...store,
        productCount: productStats.totalProducts || 0,
        products: storeProducts.map((p) => ({
          ...p,
          price: parseFloat(p.price),
          offerPrice: parseFloat(p.offerPrice),
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching store details:', error);
    return { success: false, store: null, message: 'Failed to fetch store details' };
  }
}
