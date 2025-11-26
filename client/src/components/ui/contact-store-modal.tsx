'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { sendMessageToSeller } from '@/actions/messageActions';
import { toast } from 'react-toastify';

interface ContactStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
}

export default function ContactStoreModal({
  isOpen,
  onClose,
  storeId,
  storeName,
}: ContactStoreModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const result = await sendMessageToSeller(storeId, message);

      if (result.success) {
        toast.success('Your message has been sent to the store');
        setMessage('');
        onClose();
      } else {
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Contact Store
          </DialogTitle>
          <DialogDescription>
            Send a message to <span className="font-semibold">{storeName}</span> about products,
            availability, or custom requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in... / Do you have... / Can you provide..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              The store owner will receive your message and can respond to discuss your needs.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !message.trim()} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
