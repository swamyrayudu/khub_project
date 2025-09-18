"use server";

import { db } from "@/lib/db";
import { products, sellers } from "@/lib/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ✅ FIXED: Use consistent JWT_SECRET without fallback
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Enhanced authentication function with better debugging
async function getAuthenticatedSeller() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    console.log("🔍 Debug Info:", {
      hasToken: !!token,
      tokenLength: token?.length,
      secretExists: !!JWT_SECRET,
      secretLength: JWT_SECRET?.length
    });

    if (!token) {
      console.log("❌ No token found");
      return null;
    }

    // ✅ Enhanced JWT verification with better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log("✅ JWT decoded successfully:", { 
        userId: decoded.userId, 
        email: decoded.email,
        status: decoded.status 
      });
    } catch (jwtError: any) {
      console.error("❌ JWT verification failed:", {
        error: jwtError.message,
        name: jwtError.name
      });
      
      // Try to decode without verification to see token content
      try {
        const unverified = jwt.decode(token) as any;
        console.log("🔍 Token payload (unverified):", unverified);
      } catch (decodeError) {
        console.error("❌ Token is completely malformed");
      }
      
      return null;
    }
    
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

    console.log("🔍 Database query result:", {
      found: seller.length > 0,
      status: seller[0]?.status
    });

    if (seller.length === 0) {
      console.log("❌ Seller not found for userId:", decoded.userId);
      return null;
    }

    if (seller[0].status !== 'success') {
      console.log("❌ Seller not approved, status:", seller[0].status);
      return null;
    }

    console.log("✅ Seller authenticated:", seller[0].email);
    return seller[0];

  } catch (error) {
    console.error("❌ Auth verification error:", error);
    return null;
  }
}

// ✅ Rest of your addProduct function remains the same
export async function addProduct(formData: FormData) {
  try {
    console.log("🔄 Starting addProduct...");
    
    const seller = await getAuthenticatedSeller();
    
    if (!seller) {
      console.log("❌ Authentication failed");
      return { success: false, message: "Not authenticated or approved" };
    }

    console.log("✅ Seller authenticated, proceeding with product creation");

    // Extract and sanitize form data
    const productData = {
      name: (formData.get("name") as string || '').trim(),
      description: (formData.get("description") as string || '').trim(),
      price: parseFloat(formData.get("price") as string || '0'),
      quantity: parseInt(formData.get("quantity") as string || '0', 10),
      category: (formData.get("category") as string || '').trim(),
      brand: (formData.get("brand") as string || '').trim(),
      sku: (formData.get("sku") as string || '').trim(),
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : 0,
      dimensions: (formData.get("dimensions") as string || '').trim(),
      tags: formData.get("tags") ? 
        (formData.get("tags") as string).split(',').map(tag => tag.trim()).filter(Boolean) : 
        [],
    };

    console.log("📋 Product data:", productData);

    // Validate required fields
    if (!productData.name || productData.price <= 0 || productData.quantity < 0) {
      return { 
        success: false, 
        message: "Please fill all required fields with valid values" 
      };
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now();
      productData.sku = `${seller.id.slice(0, 8)}-${timestamp}`;
    }

    // Check if SKU already exists
    if (productData.sku) {
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
    }

    // Insert product using Drizzle ORM
    const newProduct = await db
      .insert(products)
      .values({
        sellerId: seller.id,
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        quantity: productData.quantity,
        category: productData.category,
        brand: productData.brand,
        sku: productData.sku,
        weight: productData.weight.toString(),
        dimensions: productData.dimensions,
        tags: productData.tags,
        status: 'active',
      })
      .returning({
        id: products.id,
        name: products.name,
        sku: products.sku,
      });

    console.log("✅ Product added successfully:", newProduct[0]);

    // Revalidate the products page
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

// ✅ Keep your existing getSellerProducts function
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
