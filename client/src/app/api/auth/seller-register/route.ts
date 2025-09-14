import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      // Step 1 data
      shopOwnerName,
      email,
      contact,
      gender,
      permanentAddress,
      permanentAddressUrl,
      idProofUrl,
      // Step 2 data
      shopName,
      contactNumber,
      address,
      country,
      countryCode,
      state,
      stateCode,
      city,
      shopIdUrl,
      // Step 3 data
      emailVerified,
      verifiedAt,
      // Step 4 data
      password,
    } = body;

    // Validate required fields
    if (!shopOwnerName || !email || !password || !shopName || !contactNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if seller already exists using raw SQL
    const existingSeller = await sql`
      SELECT id FROM sellers WHERE email = ${email}
    `;

    if (existingSeller.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Seller with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create seller record using raw SQL
    const newSeller = await sql`
      INSERT INTO sellers (
        email, password, shop_owner_name, contact, gender, 
        permanent_address, permanent_address_url, id_proof_url,
        shop_name, shop_contact_number, address, country, 
        country_code, state, state_code, city, shop_id_url,
        email_verified, verified_at, status, created_at, updated_at
      ) VALUES (
        ${email}, ${hashedPassword}, ${shopOwnerName}, ${contact}, ${gender},
        ${permanentAddress}, ${permanentAddressUrl}, ${idProofUrl},
        ${shopName}, ${contactNumber}, ${address}, ${country},
        ${countryCode}, ${state}, ${stateCode}, ${city}, ${shopIdUrl},
        ${emailVerified || false}, ${verifiedAt ? verifiedAt : null}, 'pending', NOW(), NOW()
      ) RETURNING id, email, shop_name, status
    `;

    // Clear localStorage data after successful registration
    // This will be handled on the frontend

    return NextResponse.json({
      success: true,
      message: 'Seller registered successfully',
      seller: {
        id: newSeller[0].id,
        email: newSeller[0].email,
        shopName: newSeller[0].shop_name,
        status: newSeller[0].status,
      },
    });

  } catch (error) {
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please check your environment variables.';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables not found. Please run the SQL setup script.';
      } else {
        errorMessage = 'Registration failed. Please try again.';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
