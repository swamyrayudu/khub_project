import { NextRequest, NextResponse } from 'next/server';
import { verificationCodes } from '@/lib/verification-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Verify Code API called');
    
    const { email, code } = await request.json();
    console.log(`📧 Email: ${email}, Code: ${code}`);

    // Validate input
    if (!email || !code) {
      console.log('❌ Missing email or code');
      return NextResponse.json(
        { message: 'Email and code are required', success: false },
        { status: 400 }
      );
    }

    // Get stored data
    const storedData = verificationCodes.get(email);
    console.log('💾 Stored data:', storedData);
    
    if (!storedData) {
      console.log('❌ No verification code found');
      return NextResponse.json(
        { message: 'No verification code found. Please request a new code.', success: false },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
      console.log('❌ Code expired');
      verificationCodes.delete(email);
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new code.', success: false },
        { status: 400 }
      );
    }

    // Verify code
    if (code !== storedData.code) {
      console.log(`❌ Wrong code. Expected: ${storedData.code}, Got: ${code}`);
      return NextResponse.json(
        { message: 'Your OTP is wrong. Please try again.', success: false },
        { status: 400 }
      );
    }

    // Success - remove code
    verificationCodes.delete(email);
    console.log(`✅ Email verified successfully: ${email}`);
    
    return NextResponse.json({
      message: 'Email verified successfully!',
      success: true,
      verifiedEmail: email
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
