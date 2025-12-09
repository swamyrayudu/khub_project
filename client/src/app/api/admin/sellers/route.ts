
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET - Fetch all sellers
export async function GET() {
  try {
    const sellers = await sql`
      SELECT 
        id, 
        email, 
        shop_owner_name as name,
        shop_name, 
        status, 
        email_verified,
        contact,
        created_at,
        updated_at
      FROM sellers 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      sellers,
      count: sellers.length
    });

  } catch (error) {
    console.error('Get sellers error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}

// PATCH - Update seller status
export async function PATCH(request: NextRequest) {
  try {
    const { sellerId, status } = await request.json();

    if (!sellerId || !status) {
      return NextResponse.json(
        { success: false, message: 'Seller ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'success', 'active', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE sellers 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${sellerId}
      RETURNING id, status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Seller status updated Approvedfully',
      seller: result[0]
    });

  } catch (error) {
    console.error('Update seller status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update seller status' },
      { status: 500 }
    );
  }
}
