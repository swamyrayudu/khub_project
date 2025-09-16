import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔓 Logout API called');
    
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    // Delete the cookie with exact same options as when it was set
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    console.log('✅ Admin token cookie cleared');
    
    return response;

  } catch (error) {
    console.error('❌ Logout API error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
