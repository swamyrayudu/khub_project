

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Find user in sellers table
    const users = await sql`
      SELECT 
        id, 
        email, 
        shop_owner_name as name,
        shop_name,
        status,
        email_verified
      FROM sellers 
      WHERE id = ${decoded.userId}
    `;
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      status: user.status,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        shopName: user.shop_name,
        role: 'seller',
        emailVerified: user.email_verified
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
