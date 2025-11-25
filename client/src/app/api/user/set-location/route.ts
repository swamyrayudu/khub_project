import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/userauth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { country, countryCode, state, stateCode, city, address } = body;

    // Validate required fields
    if (!country || !countryCode || !state || !stateCode || !city || !address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Update user location in database
    await db
      .update(users)
      .set({
        country,
        countryCode,
        state,
        stateCode,
        city,
        address,
        hasCompletedProfile: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json(
      { success: true, message: 'Location saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving location:', error);
    return NextResponse.json(
      { error: 'Failed to save location' },
      { status: 500 }
    );
  }
}
