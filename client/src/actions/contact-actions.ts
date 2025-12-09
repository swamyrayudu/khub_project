
'use server';

import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export async function createContactMessage(formData: FormData) {
  try {
    const sellerEmail = formData.get('sellerEmail') as string;
    const message = formData.get('message') as string;

    // Validation
    if (!sellerEmail || !message) {
      return { 
        success: false, 
        error: 'All fields are required' 
      };
    }

    if (message.length < 10) {
      return { 
        success: false, 
        error: 'Message must be at least 10 characters long' 
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerEmail)) {
      return { 
        success: false, 
        error: 'Please enter a valid email address' 
      };
    }

    // Insert into database
    const [newContact] = await db.insert(contacts).values({
      sellerEmail,
      message,
      status: 'pending'
    }).returning();

    // Revalidate the page to reflect changes
    revalidatePath('/seller/contact');

    return { 
      success: true, 
      message: 'Your message has been sent successfully! We will get back to you soon.',
      contactId: newContact.id
    };

  } catch (error) {
    console.error('Error creating contact message:', error);
    return { 
      success: false, 
      error: 'Failed to send message. Please try again later.' 
    };
  }
}

// Get all contacts for admin (optional)
export async function getContacts() {
  try {
    const allContacts = await db
      .select()
      .from(contacts)
      .orderBy(contacts.createdAt);
    
    return allContacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}
