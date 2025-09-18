"use server";

import { db } from "@/lib/db";
import { products, sellers } from "@/lib/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

async function getAuthenticatedSeller() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

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

    if (seller.length === 0 || seller[0].status !== 'success') {
      return null;
    }

    return seller[0];
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export async function addProduct(formData: FormData) {
  try {
    const seller = await getAuthenticatedSeller();
    
    if (!seller) {
      return { success: false, message: "Not authenticated or approved" };
    }

    // Extract images from FormData
    const imagesJson = formData.get("images") as string;
    let images: string[] = [];
    
    try {
      images = imagesJson ? JSON.parse(imagesJson) : [];
    } catch (error) {
      console.error("Error parsing images:", error);
      images = [];
    }

    const productData = {
      name: (formData.get("name") as string || '').trim(),
      description: (formData.get("description") as string || '').trim(),
      price: parseFloat(formData.get("price") as string || '0'),
      offerPrice: parseFloat(formData.get("offerPrice") as string || '0'),
      quantity: parseInt(formData.get("quantity") as string || '0', 10),
      category: (formData.get("category") as string || '').trim(),
      brand: (formData.get("brand") as string || '').trim(),
      sku: (formData.get("sku") as string || '').trim(),
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : 0,
      dimensions: (formData.get("dimensions") as string || '').trim(),
      tags: formData.get("tags") ? 
        (formData.get("tags") as string).split(',').map(tag => tag.trim()).filter(Boolean) : 
        [],
      images: images
    };

    // Validate required fields
    if (!productData.name || productData.price <= 0 || productData.quantity < 0) {
      return { 
        success: false, 
        message: "Please fill all required fields with valid values" 
      };
    }

    // Validate pricing
    if (productData.offerPrice > productData.price) {
      return {
        success: false,
        message: "Offer price cannot be greater than regular price"
      };
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now();
      productData.sku = `${seller.id.slice(0, 8)}-${timestamp}`;
    }

    // Check if SKU already exists
    const existingSku = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, productData.sku))
      .limit(1);

    if (existingSku.length > 0) {
      return { 
        success: false, 
        message: "SKU already exists. Please use a different SKU." 
      };
    }

    // Insert product with offer price
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
        status: 'active',
      })
      .returning({
        id: products.id,
        name: products.name,
        sku: products.sku,
      });

    console.log("✅ Product added successfully:", newProduct[0]);

    revalidatePath('/seller/products');

    return { 
      success: true, 
      message: "Product added successfully!",
      product: newProduct[0]
    };

  } catch (error) {
    console.error("❌ Add product error:", error);
    return { 
      success: false, 
      message: "Failed to add product. Please try again." 
    };
  }
}

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

    const transformedProducts = sellerProducts.map(product => ({
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
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    }));

    return { success: true, products: transformedProducts };

  } catch (error) {
    console.error("Get products error:", error);
    return { success: false, products: [] };
  }
}
