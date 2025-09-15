import { NextRequest, NextResponse } from 'next/server';
import { verificationCodes, cleanExpiredCodes } from '@/lib/verification-storage';

// Named export for POST method (Required by Next.js App Router)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Verify Code API called');
    
    // Clean expired codes first
    cleanExpiredCodes();

    const { email, code } = await request.json();
    console.log(`📧 Verifying - Email: ${email}, Code: ${code}`);

    // Validate input
    if (!email || !code) {
      console.log('❌ Missing email or code');
      return NextResponse.json(
        { message: 'Email and verification code are required', success: false },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      console.log('❌ Invalid code length');
      return NextResponse.json(
        { message: 'Verification code must be 6 digits', success: false },
        { status: 400 }
      );
    }

    // Get stored verification data
    const storedData = verificationCodes.get(email);
    console.log('💾 Stored data for', email, ':', storedData);
    
    if (!storedData) {
      console.log('❌ No verification code found for:', email);
      return NextResponse.json(
        { message: 'No verification code found. Please request a new code.', success: false },
        { status: 400 }
      );
    }

    // Check if code has expired
    const now = Date.now();
    if (now > storedData.expiresAt) {
      console.log(`❌ Code expired for ${email}. Current time: ${new Date(now).toLocaleTimeString()}, Expires: ${new Date(storedData.expiresAt).toLocaleTimeString()}`);
      verificationCodes.delete(email);
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new code.', success: false },
        { status: 400 }
      );
    }

    // Verify the code
    if (code.toString().trim() !== storedData.code.toString().trim()) {
      console.log(`❌ Wrong OTP for ${email}. Expected: ${storedData.code}, Got: ${code}`);
      return NextResponse.json(
        { message: 'Your OTP is wrong. Please try again.', success: false },
        { status: 400 }
      );
    }

    // Success - remove the code and return success
    verificationCodes.delete(email);
    console.log(`✅ Email verified successfully: ${email}`);
    
    return NextResponse.json({
      message: 'Email verified successfully!',
      success: true,
      verifiedEmail: email
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error during verification', success: false },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to verify code.' },
    { status: 405 }
  );
}
