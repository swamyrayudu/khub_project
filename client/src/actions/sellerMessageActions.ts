'use server';

import { db } from '@/lib/db';
import { messages, users, notifications } from '@/lib/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';

interface Conversation {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  lastMessage: string | null;
  lastMessageType: string | null;
  lastMessageTime: Date | null;
  unreadCount: number;
}

// Get all messages for a seller (grouped by user)
export async function getSellerMessages(sellerId: string) {
  try {
    if (!sellerId) {
      return { success: false, conversations: [], message: 'Seller ID required' };
    }

    // Get unique users who have messaged this seller with their last message
    const conversations = await db
      .select({
        userId: messages.userId,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
        lastMessage: messages.message,
        lastMessageType: messages.senderType,
        lastMessageTime: messages.createdAt,
        unreadCount: sql<number>`COUNT(CASE WHEN ${messages.isRead} = false AND ${messages.senderType} = 'user' THEN 1 END)`,
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.sellerId, sellerId))
      .groupBy(messages.userId, users.name, users.email, users.image, messages.message, messages.senderType, messages.createdAt)
      .orderBy(desc(messages.createdAt))
      .limit(50);

    // Group by user to get unique conversations
    const uniqueConversations = conversations.reduce((acc: Conversation[], curr) => {
      const existing = acc.find(c => c.userId === curr.userId);
      if (!existing) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return { success: true, conversations: uniqueConversations };
  } catch (error) {
    console.error('Error fetching seller messages:', error);
    return { success: false, conversations: [], message: 'Failed to fetch messages' };
  }
}

// Get conversation between seller and specific user
export async function getSellerUserConversation(sellerId: string, userId: string) {
  try {
    if (!sellerId || !userId) {
      return { success: false, messages: [], message: 'Seller ID and User ID required' };
    }

    const conversation = await db
      .select({
        id: messages.id,
        message: messages.message,
        senderType: messages.senderType,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          eq(messages.sellerId, sellerId),
          eq(messages.userId, userId)
        )
      )
      .orderBy(messages.createdAt);

    return { success: true, messages: conversation };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, messages: [], message: 'Failed to fetch conversation' };
  }
}

// Seller replies to user message
export async function sendSellerReply(sellerId: string, userId: string, message: string) {
  try {
    if (!sellerId || !userId) {
      return { success: false, message: 'Seller ID and User ID required' };
    }

    if (!message.trim()) {
      return { success: false, message: 'Message cannot be empty' };
    }

    // Get user details
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Get seller shop name from previous messages
    await db
      .select({
        sellerId: messages.sellerId,
      })
      .from(messages)
      .where(
        and(
          eq(messages.sellerId, sellerId),
          eq(messages.userId, userId)
        )
      )
      .limit(1);

    // Insert seller's reply message
    const [newMessage] = await db.insert(messages).values({
      userId: userId,
      sellerId: sellerId,
      senderType: 'seller',
      message: message.trim(),
      isRead: false,
    }).returning({ id: messages.id });

    // Create notification for user
    await db.insert(notifications).values({
      recipientId: userId,
      recipientType: 'user',
      type: 'message',
      title: 'Store replied to your message',
      message: message.trim().substring(0, 100) + (message.trim().length > 100 ? '...' : ''),
      relatedId: newMessage.id,
      relatedType: 'message',
      isRead: false,
    });

    return { success: true, message: 'Reply sent successfully' };
  } catch (error) {
    console.error('Error sending seller reply:', error);
    return { success: false, message: 'Failed to send reply' };
  }
}

// Mark seller's messages as read
export async function markSellerMessagesAsRead(sellerId: string, userId: string) {
  try {
    if (!sellerId || !userId) {
      return { success: false, message: 'Seller ID and User ID required' };
    }

    await db
      .update(messages)
      .set({ isRead: true, updatedAt: new Date() })
      .where(
        and(
          eq(messages.sellerId, sellerId),
          eq(messages.userId, userId),
          eq(messages.senderType, 'user'),
          eq(messages.isRead, false)
        )
      );

    return { success: true, message: 'Messages marked as read' };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, message: 'Failed to mark messages as read' };
  }
}

// Get seller notifications
export async function getSellerNotifications(sellerId: string) {
  try {
    if (!sellerId) {
      return { success: false, notifications: [], message: 'Seller ID required' };
    }

    const sellerNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        relatedId: notifications.relatedId,
        relatedType: notifications.relatedType,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, sellerId),
          eq(notifications.recipientType, 'seller')
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return { success: true, notifications: sellerNotifications };
  } catch (error) {
    console.error('Error fetching seller notifications:', error);
    return { success: false, notifications: [], message: 'Failed to fetch notifications' };
  }
}

// Get unread message count for seller
export async function getSellerUnreadCount(sellerId: string) {
  try {
    if (!sellerId) {
      return { success: false, count: 0 };
    }

    const [result] = await db
      .select({
        count: count(),
      })
      .from(messages)
      .where(
        and(
          eq(messages.sellerId, sellerId),
          eq(messages.senderType, 'user'),
          eq(messages.isRead, false)
        )
      );

    return { success: true, count: result?.count || 0 };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, count: 0 };
  }
}
