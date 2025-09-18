"use server";

import { db } from "@/lib/db";
import { products, sellers } from "@/lib/db/schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { eq, and, ne } from "drizzle-orm"; // ✅ Added and, ne imports
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

// ✅ Add Product Function
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

    revalidatePath('/seller/viewproducts');

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

// ✅ Get Seller Products Function
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

// ✅ Get Product by ID Function
export async function getProductById(productId: string) {
  try {
    console.log("🔍 Fetching product:", productId);
    
    const seller = await getAuthenticatedSeller();
    
    if (!seller) {
      console.log("❌ Authentication failed");
      return { success: false, message: "Not authenticated or approved" };
    }

    const product = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.sellerId, seller.id) // Ensure seller can only edit their own products
        )
      )
      .limit(1);

    if (product.length === 0) {
      console.log("❌ Product not found");
      return { success: false, message: "Product not found" };
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
      created_at: product[0].createdAt.toISOString(),
      updated_at: product[0].updatedAt.toISOString(),
    };

    console.log("✅ Product found:", transformedProduct.name);
    return { success: true, product: transformedProduct };

  } catch (error) {
    console.error("❌ Get product error:", error);
    return { success: false, message: "Failed to fetch product" };
  }
}

// ✅ Update Product Function
export async function updateProduct(formData: FormData, productId: string) {
  try {
    console.log("🔄 Starting product update...");
    
    const seller = await getAuthenticatedSeller();
    
    if (!seller) {
      console.log("❌ Authentication failed");
      return { success: false, message: "Not authenticated or approved" };
    }

    console.log("✅ Seller authenticated, proceeding with product update");

    // ✅ Extract images from FormData
    const imagesJson = formData.get("images") as string;
    let images: string[] = [];
    
    try {
      images = imagesJson ? JSON.parse(imagesJson) : [];
      console.log("📷 Parsed images:", images.length, "images");
    } catch (error) {
      console.error("Error parsing images:", error);
      images = [];
    }

    // Extract and sanitize form data
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

    console.log("📋 Product data:", {
      ...productData,
      images: `${productData.images.length} images`
    });

    // Validate required fields
    if (!productData.name || productData.price <= 0 || productData.quantity < 0) {
      return { 
        success: false, 
        message: "Please fill all required fields with valid values" 
      };
    }

    // ✅ Validate pricing
    if (productData.offerPrice > productData.price) {
      return {
        success: false,
        message: "Offer price cannot be greater than regular price"
      };
    }

    // Check if SKU already exists (excluding current product)
    if (productData.sku) {
      const existingSku = await db
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            eq(products.sku, productData.sku),
            ne(products.id, productId) // Exclude current product
          )
        )
        .limit(1);

      if (existingSku.length > 0) {
        return { 
          success: false, 
          message: "SKU already exists. Please use a different SKU." 
        };
      }
    }

    // ✅ Update product with offer price and images
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
        updatedAt: new Date()
      })
      .where(
        and(
          eq(products.id, productId),
          eq(products.sellerId, seller.id) // Ensure seller can only update their own products
        )
      )
      .returning({
        id: products.id,
        name: products.name,
        sku: products.sku,
      });

    if (updatedProduct.length === 0) {
      return {
        success: false,
        message: "Product not found or you don't have permission to update it"
      };
    }

    console.log("✅ Product updated successfully:", {
      ...updatedProduct[0],
      imageCount: productData.images.length,
      hasOffer: productData.offerPrice > 0
    });

    // Revalidate the products page
    revalidatePath('/seller/viewproducts');

    return { 
      success: true, 
      message: "Product updated successfully!",
      product: updatedProduct[0]
    };

  } catch (error) {
    console.error("❌ Update product error:", error);
    return { 
      success: false, 
      message: "Failed to update product. Please try again." 
    };
  }
}

// ✅ Delete Product Function (Bonus)
export async function deleteProduct(productId: string) {
  try {
    console.log("🗑️ Deleting product:", productId);
    
    const seller = await getAuthenticatedSeller();
    
    if (!seller) {
      console.log("❌ Authentication failed");
      return { success: false, message: "Not authenticated or approved" };
    }

    const deletedProduct = await db
      .delete(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.sellerId, seller.id) // Ensure seller can only delete their own products
        )
      )
      .returning({
        id: products.id,
        name: products.name,
      });

    if (deletedProduct.length === 0) {
      return {
        success: false,
        message: "Product not found or you don't have permission to delete it"
      };
    }

    console.log("✅ Product deleted successfully:", deletedProduct[0]);

    // Revalidate the products page
    revalidatePath('/seller/viewproducts');

    return { 
      success: true, 
      message: "Product deleted successfully!",
      product: deletedProduct[0]
    };

  } catch (error) {
    console.error("❌ Delete product error:", error);
    return { 
      success: false, 
      message: "Failed to delete product. Please try again." 
    };
  }
}
