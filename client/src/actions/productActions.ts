'use server';

import { db } from '@/lib/db';
import { products, sellers } from '@/lib/db/schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { eq, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

// ============================================
// HELPER FUNCTIONS
// ============================================

// ✅ Extract coordinates from Google Maps URL
function extractCoordinatesFromUrl(url: string): { latitude: number | null; longitude: number | null } {
  if (!url || url.trim() === '') {
    return { latitude: null, longitude: null };
  }

  try {
    // Pattern 1: @lat,lng format (most common)
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const atMatch = url.match(atPattern);
    
    if (atMatch) {
      return {
        latitude: parseFloat(atMatch[1]),
        longitude: parseFloat(atMatch[2])
      };
    }

    // Pattern 2: ll=lat,lng format
    const llPattern = /ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const llMatch = url.match(llPattern);
    
    if (llMatch) {
      return {
        latitude: parseFloat(llMatch[1]),
        longitude: parseFloat(llMatch[2])
      };
    }

    // Pattern 3: q=lat,lng format
    const qPattern = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qMatch = url.match(qPattern);
    
    if (qMatch) {
      return {
        latitude: parseFloat(qMatch[1]),
        longitude: parseFloat(qMatch[2])
      };
    }

    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return { latitude: null, longitude: null };
  }
}

// ✅ Validate Google Maps URL format
function isValidGoogleMapsUrl(url: string): boolean {
  if (!url || url.trim() === '') return true; // Empty is valid (optional field)
  
  const googleMapsPatterns = [
    /^https?:\/\/(www\.)?google\.[a-z]+\/maps/i,
    /^https?:\/\/maps\.google\.[a-z]+/i,
    /^https?:\/\/goo\.gl\/maps/i,
    /^https?:\/\/maps\.app\.goo\.gl/i
  ];

  return googleMapsPatterns.some(pattern => pattern.test(url));
}

// AUTHENTICATION HELPER
async function getAuthenticatedSeller() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const seller = await db
      .select({
        id: sellers.id,
        email: sellers.email,
        shopName: sellers.shopName,
        status: sellers.status,
      })
      .from(sellers)
      .where(eq(sellers.id, decoded.userId))
      .limit(1);

    // Allowed statuses that are permitted to act as an authenticated seller
    const allowedStatuses = ['approved', 'success', 'active'];

    const sellerStatus = seller?.[0]?.status ?? '';

    if (seller.length === 0 || !allowedStatuses.includes(String(sellerStatus))) {
      return null;
    }

    return seller[0];
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// ============================================
// PUBLIC FUNCTIONS (FOR USERS)
// ============================================

// ✅ Get All Seller Products for User Display (PUBLIC)
export async function getAllSellerProducts() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        offerPrice: products.offerPrice,
        quantity: products.quantity,
        category: products.category,
        brand: products.brand,
        sku: products.sku,
        status: products.status,
        weight: products.weight,
        dimensions: products.dimensions,
        tags: products.tags,
        images: products.images,
        googleMapsUrl: products.googleMapsUrl,
        latitude: products.latitude,
        longitude: products.longitude,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        sellerName: sellers.shopOwnerName,
        sellerShopName: sellers.shopName,
        sellerAddress: sellers.address,
        sellerCity: sellers.city,
        sellerState: sellers.state,
        sellerContact: sellers.shopContactNumber,
      })
      .from(products)
      .leftJoin(sellers, eq(products.sellerId, sellers.id))
      .where(eq(products.status, 'active'))
      .orderBy(products.createdAt);

    const transformedProducts = allProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      offerPrice: parseFloat(product.offerPrice),
      quantity: product.quantity,
      category: product.category || '',
      brand: product.brand || '',
      sku: product.sku || '',
      status: product.status,
      weight: product.weight ? parseFloat(product.weight) : undefined,
      dimensions: product.dimensions || '',
      tags: product.tags || [],
      images: product.images || [],
      googleMapsUrl: product.googleMapsUrl || '',
      latitude: product.latitude ? parseFloat(product.latitude) : undefined,
      longitude: product.longitude ? parseFloat(product.longitude) : undefined,
      createdAt: product.createdAt?.toISOString?.() || product.createdAt,
      updatedAt: product.updatedAt?.toISOString?.() || product.updatedAt,
      sellerName: product.sellerName || 'Unknown Seller',
      sellerShopName: product.sellerShopName || '',
      sellerAddress: product.sellerAddress || '',
      sellerCity: product.sellerCity || '',
      sellerState: product.sellerState || '',
      sellerContact: product.sellerContact || '',
    }));

    return { success: true, products: transformedProducts };
  } catch (error) {
    console.error('Get all seller products error:', error);
    return { success: false, products: [] };
  }
}

// ============================================
// SELLER FUNCTIONS (REQUIRES AUTHENTICATION)
// ============================================

// ✅ Get Seller's Own Products
export async function getSellerProducts() {
  try {
    const seller = await getAuthenticatedSeller();

    if (!seller) {
      return { success: false, products: [] };
    }

    const sellerProducts = await db
      .select()
      .from(products)
      .where(eq(products.sellerId, seller.id))
      .orderBy(products.createdAt);

    const transformedProducts = sellerProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      offerPrice: parseFloat(product.offerPrice),
      quantity: product.quantity,
      category: product.category || '',
      brand: product.brand || '',
      sku: product.sku || '',
      status: product.status,
      weight: product.weight ? parseFloat(product.weight) : undefined,
      dimensions: product.dimensions || '',
      tags: product.tags || [],
      images: product.images || [],
      googleMapsUrl: product.googleMapsUrl || '',
      latitude: product.latitude ? parseFloat(product.latitude) : undefined,
      longitude: product.longitude ? parseFloat(product.longitude) : undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return { success: true, products: transformedProducts };
  } catch (error) {
    console.error('Get products error:', error);
    return { success: false, products: [] };
  }
}

// ✅ Add Product Function
export async function addProduct(formData: FormData) {
  try {
    const seller = await getAuthenticatedSeller();

    if (!seller) {
      return { success: false, message: 'Not authenticated or approved' };
    }

    const imagesJson = formData.get('images') as string;
    let images: string[] = [];

    try {
      images = imagesJson ? JSON.parse(imagesJson) : [];
    } catch (error) {
      console.error('Error parsing images:', error);
      images = [];
    }

    const googleMapsUrl = (formData.get('googleMapsUrl') as string || '').trim();

    // Validate Google Maps URL if provided
    if (googleMapsUrl && !isValidGoogleMapsUrl(googleMapsUrl)) {
      return {
        success: false,
        message: 'Invalid Google Maps URL format. Please provide a valid Google Maps link.',
      };
    }

    // Extract coordinates from URL
    const { latitude, longitude } = extractCoordinatesFromUrl(googleMapsUrl);

    const productData = {
      name: (formData.get('name') as string || '').trim(),
      description: (formData.get('description') as string || '').trim(),
      price: parseFloat(formData.get('price') as string || '0'),
      offerPrice: parseFloat(formData.get('offerPrice') as string || '0'),
      quantity: parseInt(formData.get('quantity') as string || '0', 10),
      category: (formData.get('category') as string || '').trim(),
      brand: (formData.get('brand') as string || '').trim(),
      sku: (formData.get('sku') as string || '').trim(),
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : 0,
      dimensions: (formData.get('dimensions') as string || '').trim(),
      tags: formData.get('tags')
        ? (formData.get('tags') as string).split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      images: images,
      googleMapsUrl: googleMapsUrl,
      latitude: latitude,
      longitude: longitude,
    };

    if (!productData.name || productData.price <= 0 || productData.quantity < 0) {
      return {
        success: false,
        message: 'Please fill all required fields with valid values',
      };
    }

    if (productData.offerPrice > productData.price) {
      return {
        success: false,
        message: 'Offer price cannot be greater than regular price',
      };
    }

    if (!productData.sku) {
      const timestamp = Date.now();
      productData.sku = `${seller.id.slice(0, 8)}-${timestamp}`;
    }

    const existingSku = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, productData.sku))
      .limit(1);

    if (existingSku.length > 0) {
      return {
        success: false,
        message: 'SKU already exists. Please use a different SKU.',
      };
    }

    const newProduct = await db
      .insert(products)
      .values({
        sellerId: seller.id,
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        offerPrice: productData.offerPrice.toString(),
        quantity: productData.quantity,
        category: productData.category,
        brand: productData.brand,
        sku: productData.sku,
        weight: productData.weight.toString(),
        dimensions: productData.dimensions,
        tags: productData.tags,
        images: productData.images,
        googleMapsUrl: productData.googleMapsUrl,
        latitude: productData.latitude ? productData.latitude.toString() : null,
        longitude: productData.longitude ? productData.longitude.toString() : null,
        status: 'active',
      })
      .returning({
        id: products.id,
        name: products.name,
        sku: products.sku,
      });

    console.log('✅ Product added successfully:', newProduct[0]);

    revalidatePath('/seller/viewproducts');

    return {
      success: true,
      message: 'Product added successfully!',
      product: newProduct[0],
    };
  } catch (error) {
    console.error('❌ Add product error:', error);
    return {
      success: false,
      message: 'Failed to add product. Please try again.',
    };
  }
}

// ✅ Get Product by ID Function
export async function getProductById(productId: string) {
  try {
    console.log('🔍 Fetching product:', productId);

    const seller = await getAuthenticatedSeller();

    if (!seller) {
      console.log('❌ Authentication failed');
      return { success: false, message: 'Not authenticated or approved' };
    }

    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)))
      .limit(1);

    if (product.length === 0) {
      console.log('❌ Product not found');
      return { success: false, message: 'Product not found' };
    }

    const transformedProduct = {
      id: product[0].id,
      name: product[0].name,
      description: product[0].description || '',
      price: parseFloat(product[0].price),
      offerPrice: parseFloat(product[0].offerPrice),
      quantity: product[0].quantity,
      category: product[0].category || '',
      brand: product[0].brand || '',
      sku: product[0].sku || '',
      status: product[0].status,
      weight: product[0].weight ? parseFloat(product[0].weight) : undefined,
      dimensions: product[0].dimensions || '',
      tags: product[0].tags || [],
      images: product[0].images || [],
      googleMapsUrl: product[0].googleMapsUrl || '',
      latitude: product[0].latitude ? parseFloat(product[0].latitude) : undefined,
      longitude: product[0].longitude ? parseFloat(product[0].longitude) : undefined,
      createdAt: product[0].createdAt.toISOString(),
      updatedAt: product[0].updatedAt.toISOString(),
    };

    console.log('✅ Product found:', transformedProduct.name);
    return { success: true, product: transformedProduct };
  } catch (error) {
    console.error('❌ Get product error:', error);
    return { success: false, message: 'Failed to fetch product' };
  }
}

// ✅ Update Product Function
export async function updateProduct(formData: FormData, productId: string) {
  try {
    console.log('🔄 Starting product update...');

    const seller = await getAuthenticatedSeller();

    if (!seller) {
      console.log('❌ Authentication failed');
      return { success: false, message: 'Not authenticated or approved' };
    }

    const imagesJson = formData.get('images') as string;
    let images: string[] = [];

    try {
      images = imagesJson ? JSON.parse(imagesJson) : [];
    } catch (error) {
      console.error('Error parsing images:', error);
      images = [];
    }

    const googleMapsUrl = (formData.get('googleMapsUrl') as string || '').trim();

    // Validate Google Maps URL if provided
    if (googleMapsUrl && !isValidGoogleMapsUrl(googleMapsUrl)) {
      return {
        success: false,
        message: 'Invalid Google Maps URL format. Please provide a valid Google Maps link.',
      };
    }

    // Extract coordinates from URL
    const { latitude, longitude } = extractCoordinatesFromUrl(googleMapsUrl);

    const productData = {
      name: (formData.get('name') as string || '').trim(),
      description: (formData.get('description') as string || '').trim(),
      price: parseFloat(formData.get('price') as string || '0'),
      offerPrice: parseFloat(formData.get('offerPrice') as string || '0'),
      quantity: parseInt(formData.get('quantity') as string || '0', 10),
      category: (formData.get('category') as string || '').trim(),
      brand: (formData.get('brand') as string || '').trim(),
      sku: (formData.get('sku') as string || '').trim(),
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : 0,
      dimensions: (formData.get('dimensions') as string || '').trim(),
      tags: formData.get('tags')
        ? (formData.get('tags') as string).split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      images: images,
      googleMapsUrl: googleMapsUrl,
      latitude: latitude,
      longitude: longitude,
    };

    if (!productData.name || productData.price <= 0 || productData.quantity < 0) {
      return {
        success: false,
        message: 'Please fill all required fields with valid values',
      };
    }

    if (productData.offerPrice > productData.price) {
      return {
        success: false,
        message: 'Offer price cannot be greater than regular price',
      };
    }

    if (productData.sku) {
      const existingSku = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.sku, productData.sku), ne(products.id, productId)))
        .limit(1);

      if (existingSku.length > 0) {
        return {
          success: false,
          message: 'SKU already exists. Please use a different SKU.',
        };
      }
    }

    const updatedProduct = await db
      .update(products)
      .set({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        offerPrice: productData.offerPrice.toString(),
        quantity: productData.quantity,
        category: productData.category,
        brand: productData.brand,
        sku: productData.sku || null,
        weight: productData.weight.toString(),
        dimensions: productData.dimensions,
        tags: productData.tags,
        images: productData.images,
        googleMapsUrl: productData.googleMapsUrl,
        latitude: productData.latitude ? productData.latitude.toString() : null,
        longitude: productData.longitude ? productData.longitude.toString() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)))
      .returning({
        id: products.id,
        name: products.name,
        sku: products.sku,
      });

    if (updatedProduct.length === 0) {
      return {
        success: false,
        message: "Product not found or you don't have permission to update it",
      };
    }

    console.log('✅ Product updated successfully:', updatedProduct[0]);

    revalidatePath('/seller/viewproducts');

    return {
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct[0],
    };
  } catch (error) {
    console.error('❌ Update product error:', error);
    return {
      success: false,
      message: 'Failed to update product. Please try again.',
    };
  }
}

// ✅ Delete Product Function
export async function deleteProduct(productId: string) {
  try {
    console.log('🗑️ Deleting product:', productId);

    const seller = await getAuthenticatedSeller();

    if (!seller) {
      console.log('❌ Authentication failed');
      return { success: false, message: 'Not authenticated or approved' };
    }

    const deletedProduct = await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)))
      .returning({
        id: products.id,
        name: products.name,
      });

    if (deletedProduct.length === 0) {
      return {
        success: false,
        message: "Product not found or you don't have permission to delete it",
      };
    }

    console.log('✅ Product deleted successfully:', deletedProduct[0]);

    revalidatePath('/seller/viewproducts');

    return {
      success: true,
      message: 'Product deleted successfully!',
      product: deletedProduct[0],
    };
  } catch (error) {
    console.error('❌ Delete product error:', error);
    return {
      success: false,
      message: 'Failed to delete product. Please try again.',
    };
  }
}

// ✅ Get Product Stats
export async function getProductStats() {
  try {
    console.log('📊 Fetching product statistics...');

    const seller = await getAuthenticatedSeller();

    if (!seller) {
      console.log('❌ Authentication failed');
      return { success: false, stats: null };
    }

    const allProducts = await db.select().from(products).where(eq(products.sellerId, seller.id));

    const stats = {
      totalProducts: allProducts.length,
      activeProducts: allProducts.filter((p) => p.status === 'active').length,
      inactiveProducts: allProducts.filter((p) => p.status === 'inactive').length,
      outOfStock: allProducts.filter((p) => p.quantity === 0).length,
      lowStock: allProducts.filter((p) => p.quantity > 0 && p.quantity <= 5).length,
      totalValue: allProducts.reduce((sum, p) => sum + parseFloat(p.price), 0),
      averagePrice:
        allProducts.length > 0
          ? allProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) / allProducts.length
          : 0,
      productsWithOffers: allProducts.filter((p) => parseFloat(p.offerPrice) > 0).length,
      productsWithLocation: allProducts.filter((p) => p.googleMapsUrl && p.googleMapsUrl.trim() !== '').length,
    };

    console.log('✅ Product stats calculated:', stats);

    return { success: true, stats };
  } catch (error) {
    console.error('❌ Get product stats error:', error);
    return { success: false, stats: null };
  }
}
