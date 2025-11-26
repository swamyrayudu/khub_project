'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Store,
  Clock,
  ArrowRight,
  Inbox,
  Mail,
  User,
  LogIn,
} from 'lucide-react';
import { getUserConversations } from '@/actions/messageActions';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Conversation {
  sellerId: string;
  shopName: string;
  shopOwnerName: string;
  email: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      if (status === 'unauthenticated') {
        setLoading(false);
        return;
      }

      if (status === 'loading') {
        return;
      }

      setLoading(true);
      try {
        const result = await getUserConversations();
        if (result.success) {
          setConversations(result.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();

    // Set up polling for real-time updates (every 15 seconds, only when tab is visible)
    const interval = setInterval(() => {
      if (status === 'authenticated' && document.visibilityState === 'visible') {
        fetchConversations();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [status]);

  const handleConversationClick = (sellerId: string) => {
    router.push(`/shop/stores/${sellerId}`);
  };

  // Show login prompt if user is not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">View your conversations with stores</p>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please log in to view your messages and conversations with stores
                </p>
                <Link href="/auth">
                  <Button size="lg" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In to Continue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage your conversations with stores
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Loading State */}
        {loading || status === 'loading' ? (
          <div className="flex flex-col items-center justify-center h-64">
            <MessageSquare className="w-10 h-10 text-muted-foreground animate-pulse mb-3" />
            <p className="text-sm text-muted-foreground">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                You haven't started any conversations with stores yet. Visit a store and click
                "Contact Store" to send your first message.
              </p>
              <Link href="/shop/stores">
                <Button className="gap-2">
                  <Store className="w-4 h-4" />
                  Browse Stores
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card
                key={conversation.sellerId}
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleConversationClick(conversation.sellerId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Store Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Conversation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                            {conversation.shopName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span className="truncate">{conversation.shopOwnerName}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>

                      <Separator className="my-3" />

                      {/* Last Message */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {conversation.lastMessage}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {!conversation.unreadCount && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
