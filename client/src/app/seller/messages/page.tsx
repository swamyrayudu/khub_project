'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  User,
  Mail,
  Clock,
  Send,
  Inbox,
  ArrowLeft,
  CheckCheck,
} from 'lucide-react';
import {
  getSellerMessages,
  getSellerUserConversation,
  sendSellerReply,
  markSellerMessagesAsRead,
} from '@/actions/sellerMessageActions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  lastMessage: string;
  lastMessageType: string;
  lastMessageTime: Date;
  unreadCount: number;
}

interface Message {
  id: string;
  message: string;
  senderType: string;
  isRead: boolean;
  createdAt: Date;
}

export default function SellerMessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [sellerId, setSellerId] = useState<string>('');

  useEffect(() => {
    // Get seller ID from localStorage
    const userDataString = localStorage.getItem('userData');
    
    if (!userDataString) {
      router.push('/seller/auth/login');
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      if (userData.id) {
        setSellerId(userData.id);
        fetchConversations(userData.id);
      } else {
        router.push('/seller/auth/login');
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/seller/auth/login');
    }
  }, [router]);

  const fetchConversations = async (sellerIdParam: string) => {
    setLoading(true);
    try {
      const result = await getSellerMessages(sellerIdParam);
      if (result.success) {
        setConversations(result.conversations);
      } else {
        toast.error(result.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (conversation: Conversation) => {
    setSelectedUser(conversation);
    setLoading(true);

    try {
      const result = await getSellerUserConversation(sellerId, conversation.userId);
      if (result.success) {
        setMessages(result.messages);
        
        // Mark messages as read
        if (conversation.unreadCount > 0) {
          await markSellerMessagesAsRead(sellerId, conversation.userId);
          // Update conversation unread count
          setConversations(conversations.map(c => 
            c.userId === conversation.userId ? { ...c, unreadCount: 0 } : c
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyMessage.trim() || !selectedUser) {
      toast.error('Please enter a message');
      return;
    }

    setSendingReply(true);
    try {
      const result = await sendSellerReply(sellerId, selectedUser.userId, replyMessage);
      
      if (result.success) {
        toast.success('Reply sent successfully');
        setReplyMessage('');
        
        // Refresh conversation
        const conversationResult = await getSellerUserConversation(sellerId, selectedUser.userId);
        if (conversationResult.success) {
          setMessages(conversationResult.messages);
        }
        
        // Refresh conversations list
        fetchConversations(sellerId);
      } else {
        toast.error(result.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Customer Messages</h1>
                <p className="text-sm text-muted-foreground">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Inbox className="w-5 h-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading && !selectedUser ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="w-10 h-10 text-muted-foreground animate-pulse mb-3" />
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <Inbox className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground text-center">
                      No customer messages yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.userId}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedUser?.userId === conversation.userId ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleSelectUser(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            {conversation.userImage ? (
                              <Image
                                src={conversation.userImage}
                                alt={conversation.userName || 'User'}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-foreground" />
                              </div>
                            )}
                            {conversation.unreadCount > 0 && (
                              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.userName || 'User'}
                              </h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{conversation.userEmail}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {conversation.lastMessageType === 'seller' && 'You: '}
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
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      {selectedUser.userImage ? (
                        <Image
                          src={selectedUser.userImage}
                          alt={selectedUser.userName || 'User'}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-foreground" />
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold">{selectedUser.userName || 'User'}</h2>
                        <p className="text-sm text-muted-foreground">{selectedUser.userEmail}</p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderType === 'seller' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderType === 'seller'
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
                              {message.senderType === 'seller' && message.isRead && (
                                <CheckCheck className="w-3 h-3 ml-1 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>

                  {/* Reply Form */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendReply} className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                        disabled={sendingReply}
                      />
                      <Button
                        type="submit"
                        disabled={sendingReply || !replyMessage.trim()}
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {sendingReply ? 'Sending...' : 'Send'}
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
                      Choose a customer from the list to view and reply to their messages
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
