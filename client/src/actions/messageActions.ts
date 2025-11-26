'use server';

import { db } from '@/lib/db';
import { messages, sellers, notifications, users } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/userauth';

// Send a message from user to seller
export async function sendMessageToSeller(sellerId: string, message: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'You must be logged in to send messages' };
    }

    if (!message.trim()) {
      return { success: false, message: 'Message cannot be empty' };
    }

    // Verify seller exists and get seller details
    const [seller] = await db
      .select({ 
        id: sellers.id,
        shopName: sellers.shopName,
      })
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (!seller) {
      return { success: false, message: 'Store not found' };
    }

    // Get user details
    const userName = session.user.name || 'User';

    // Insert message
    const [newMessage] = await db.insert(messages).values({
      userId: session.user.id,
      sellerId: sellerId,
      senderType: 'user',
      message: message.trim(),
      isRead: false,
    }).returning({ id: messages.id });

    // Create notification for seller
    await db.insert(notifications).values({
      recipientId: sellerId,
      recipientType: 'seller',
      type: 'message',
      title: `New message from ${userName}`,
      message: message.trim().substring(0, 100) + (message.trim().length > 100 ? '...' : ''),
      relatedId: newMessage.id,
      relatedType: 'message',
      isRead: false,
    });

    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: 'Failed to send message' };
  }
}

// Get conversation between user and seller with seller details
export async function getConversation(sellerId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, messages: [], sellerInfo: null, message: 'Not authenticated' };
    }

    // Get seller info
    const [sellerInfo] = await db
      .select({
        id: sellers.id,
        shopName: sellers.shopName,
        shopOwnerName: sellers.shopOwnerName,
        email: sellers.email,
      })
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (!sellerInfo) {
      return { success: false, messages: [], sellerInfo: null, message: 'Store not found' };
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
          eq(messages.userId, session.user.id),
          eq(messages.sellerId, sellerId)
        )
      )
      .orderBy(messages.createdAt);

    return { success: true, messages: conversation, sellerInfo };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, messages: [], sellerInfo: null, message: 'Failed to fetch conversation' };
  }
}

// Get all conversations for a user
export async function getUserConversations() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, conversations: [], message: 'Not authenticated' };
    }

    // Get unique sellers user has messaged with
    const conversations = await db
      .select({
        sellerId: messages.sellerId,
        shopName: sellers.shopName,
        shopOwnerName: sellers.shopOwnerName,
        email: sellers.email,
        lastMessage: messages.message,
        lastMessageTime: messages.createdAt,
        unreadCount: messages.isRead,
      })
      .from(messages)
      .innerJoin(sellers, eq(messages.sellerId, sellers.id))
      .where(eq(messages.userId, session.user.id))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    // Group by seller to get unique conversations
    const uniqueConversations = conversations.reduce((acc: any[], curr) => {
      const existing = acc.find(c => c.sellerId === curr.sellerId);
      if (!existing) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return { success: true, conversations: uniqueConversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, conversations: [], message: 'Failed to fetch conversations' };
  }
}

// Mark messages as read
export async function markMessagesAsRead(sellerId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Not authenticated' };
    }

    await db
      .update(messages)
      .set({ isRead: true, updatedAt: new Date() })
      .where(
        and(
          eq(messages.userId, session.user.id),
          eq(messages.sellerId, sellerId),
          eq(messages.senderType, 'seller'),
          eq(messages.isRead, false)
        )
      );

    return { success: true, message: 'Messages marked as read' };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, message: 'Failed to mark messages as read' };
  }
}

// Get user notifications
export async function getUserNotifications() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, notifications: [], message: 'Not authenticated' };
    }

    const userNotifications = await db
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
          eq(notifications.recipientId, session.user.id),
          eq(notifications.recipientType, 'user')
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return { success: true, notifications: userNotifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, notifications: [], message: 'Failed to fetch notifications' };
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Not authenticated' };
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    return { success: true, message: 'Notification marked as read' };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, message: 'Failed to mark notification as read' };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, message: 'Not authenticated' };
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.recipientId, session.user.id),
          eq(notifications.recipientType, 'user'),
          eq(notifications.isRead, false)
        )
      );

    return { success: true, message: 'All notifications marked as read' };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, message: 'Failed to mark notifications as read' };
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, count: 0 };
    }

    const [result] = await db
      .select({
        count: notifications.id,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, session.user.id),
          eq(notifications.recipientType, 'user'),
          eq(notifications.isRead, false)
        )
      );

    return { success: true, count: result?.count ? 1 : 0 };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, count: 0 };
  }
}
