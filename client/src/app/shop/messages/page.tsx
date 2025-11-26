'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Store,
  Clock,
  ArrowRight,
  Inbox,
  Mail,
  User,
  LogIn,
  Send,
  ArrowLeft,
  CheckCheck,
} from 'lucide-react';
import { getUserConversations, getConversation, sendMessageToSeller, markMessagesAsRead } from '@/actions/messageActions';
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

interface Message {
  id: string;
  message: string;
  senderType: string;
  isRead: boolean;
  createdAt: Date;
}

interface SellerInfo {
  id: string;
  shopName: string;
  shopOwnerName: string;
  email: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  const handleConversationClick = async (conversation: Conversation) => {
    setSelectedSeller(conversation);
    setLoading(true);

    try {
      const result = await getConversation(conversation.sellerId);
      if (result.success) {
        setMessages(result.messages);
        setSellerInfo(result.sellerInfo);
        
        // Mark messages as read
        await markMessagesAsRead(conversation.sellerId);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedSeller) {
      return;
    }

    setSendingMessage(true);
    try {
      const result = await sendMessageToSeller(selectedSeller.sellerId, newMessage);
      
      if (result.success) {
        setNewMessage('');
        
        // Refresh conversation
        const conversationResult = await getConversation(selectedSeller.sellerId);
        if (conversationResult.success) {
          setMessages(conversationResult.messages);
        }
        
        // Refresh conversations list
        const conversationsResult = await getUserConversations();
        if (conversationsResult.success) {
          setConversations(conversationsResult.conversations);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Poll for new messages in active conversation
  useEffect(() => {
    if (!selectedSeller) return;

    const refreshConversation = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const result = await getConversation(selectedSeller.sellerId);
          if (result.success) {
            setMessages(result.messages);
          }
        } catch (error) {
          console.error('Error refreshing conversation:', error);
        }
      }
    };

    // Refresh conversation every 10 seconds when viewing
    const interval = setInterval(refreshConversation, 10000);

    return () => clearInterval(interval);
  }, [selectedSeller]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {selectedSeller && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSeller(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">
                  {selectedSeller ? sellerInfo?.shopName : 'Messages'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedSeller 
                    ? sellerInfo?.shopOwnerName
                    : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 overflow-y-auto">
            <Card className="h-full">
              <CardContent className="p-0">
                {loading && !selectedSeller ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="w-10 h-10 text-muted-foreground animate-pulse mb-3" />
                    <p className="text-sm text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Inbox className="w-12 h-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Visit a store to start a conversation
                    </p>
                    <Link href="/shop/stores">
                      <Button className="gap-2">
                        <Store className="w-4 h-4" />
                        Browse Stores
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.sellerId}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedSeller?.sellerId === conversation.sellerId ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                              <Store className="w-5 h-5 text-primary-foreground" />
                            </div>
                            {!conversation.unreadCount && (
                              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive">
                                !
                              </Badge>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.shopName}
                              </h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{conversation.shopOwnerName}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedSeller ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{sellerInfo?.shopName}</h2>
                        <p className="text-sm text-muted-foreground">{sellerInfo?.shopOwnerName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderType === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderType === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 opacity-70" />
                                <span className="text-xs opacity-70">
                                  {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.senderType === 'user' && message.isRead && (
                                  <CheckCheck className="w-3 h-3 ml-1 opacity-70" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </CardContent>

                  {/* Message Form */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                        disabled={sendingMessage}
                      />
                      <Button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a store from the list to view and send messages
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
