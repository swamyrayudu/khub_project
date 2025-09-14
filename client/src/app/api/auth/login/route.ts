import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // ... existing validation logic ...

    const users = await sql`
      SELECT 
        id, email, password, shop_owner_name as name,
        shop_name, contact, status, email_verified, created_at
      FROM sellers 
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'seller' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      shopName: user.shop_name,
      contact: user.contact,
      role: 'seller',
      emailVerified: user.email_verified,
      createdAt: user.created_at
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
      status: user.status
    });

    // 🔥 CRITICAL: Set HTTP-only cookie for middleware
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
