"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function loginAdmin(email: string, password: string) {
  try {
    console.log("🔐 Admin login attempt:", email);

    // Validate inputs
    if (!email || !password) {
      return { 
        success: false, 
        message: "Email and password are required" 
      };
    }

    // Get admin user from database
    const users = await sql`
      SELECT id, email, password, name, created_at
      FROM admin_users 
      WHERE email = ${email.toLowerCase().trim()}
    `;

    if (users.length === 0) {
      console.log("❌ Admin user not found:", email);
      return { 
        success: false, 
        message: "Invalid email or password" 
      };
    }

    const user = users[0];

    // Compare plain text password (as requested)
    if (password !== user.password) {
      console.log("❌ Invalid password for admin:", email);
      return { 
        success: false, 
        message: "Invalid email or password" 
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name,
        role: "admin",
        loginTime: new Date().toISOString()
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax"
    });

    console.log("✅ Admin login successful:", email);

    return { 
      success: true, 
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "admin"
      }
    };

  } catch (error) {
    console.error("❌ Admin login error:", error);
    return { 
      success: false, 
      message: "Login failed. Please try again." 
    };
  }
}

// Logout function
export async function logoutAdmin() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    
    console.log("✅ Admin logged out");
  } catch (error) {
    console.error("❌ Logout error:", error);
  }
  
  redirect("/admin/login");
}

// Verify admin authentication
export async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    // Verify user still exists in database
    const users = await sql`
      SELECT id, email, name
      FROM admin_users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return null;
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

  } catch (error) {
    console.error("❌ Auth verification error:", error);
    return null;
  }
}

// Update admin password (for future use)
export async function updateAdminPassword(currentPassword: string, newPassword: string) {
  try {
    const adminUser = await verifyAdminAuth();
    
    if (!adminUser) {
      return { success: false, message: "Not authenticated" };
    }

    // Get current password from database
    const users = await sql`
      SELECT password FROM admin_users WHERE id = ${adminUser.id}
    `;

    if (users.length === 0 || users[0].password !== currentPassword) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Update password
    await sql`
      UPDATE admin_users 
      SET password = ${newPassword}, updated_at = NOW()
      WHERE id = ${adminUser.id}
    `;

    console.log("✅ Admin password updated for:", adminUser.email);

    return { success: true, message: "Password updated successfully" };

  } catch (error) {
    console.error("❌ Password update error:", error);
    return { success: false, message: "Failed to update password" };
  }
}


// Add this function to your existing adminAuth.ts file
export async function getAdminUserData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    // Get fresh user data from database
    const users = await sql`
      SELECT id, email, name
      FROM admin_users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return null;
    }

    return {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name,
      role: "admin"
    };

  } catch (error) {
    console.error("❌ Get admin user error:", error);
    return null;
  }
}
