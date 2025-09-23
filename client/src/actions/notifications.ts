'use server';

import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Count unread contacts (pending)
export async function getUnreadContactsCount() {
  const rows = await db
    .select({ c: count() })
    .from(contacts)
    .where(eq(contacts.status, 'pending'));

  const total = Number(rows?.[0]?.c ?? 0);
  return { total };
}

// Mark all unread as read (set status to 'resolved', or set isRead=true if you store it)
export async function markAllContactsAsRead() {
  // If you have isRead boolean:
  // const res = await db.update(contacts).set({ isRead: true }).where(eq(contacts.isRead, false));

  const res = await db
    .update(contacts)
    .set({ status: 'resolved' })
    .where(eq(contacts.status, 'pending'));

  // Revalidate pages that show the counter/list
  revalidatePath('/admin/notificationadmin');
  revalidatePath('/admin/home');

  // Return affected rows if supported by your driver; otherwise just ok
  return { ok: true };
}
