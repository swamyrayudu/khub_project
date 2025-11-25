import { NextResponse } from 'next/server';
import { auth } from '@/lib/userauth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        hasCompletedProfile: user.hasCompletedProfile || false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          country: user.country,
          countryCode: user.countryCode,
          state: user.state,
          stateCode: user.stateCode,
          city: user.city,
          address: user.address,
          emailVerified: user.emailVerified,
          hasCompletedProfile: user.hasCompletedProfile || false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking profile status:', error);
    return NextResponse.json(
      { error: 'Failed to check profile status' },
      { status: 500 }
    );
  }
}
