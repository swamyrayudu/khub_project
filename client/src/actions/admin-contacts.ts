
'use server';

import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function getAllContacts() {
  const rows = await db
    .select({
      id: contacts.id,
      sellerEmail: contacts.sellerEmail,
      message: contacts.message,
      status: contacts.status,
      createdAt: contacts.createdAt,
    })
    .from(contacts)
    .orderBy(desc(contacts.createdAt));
  return rows;
}
