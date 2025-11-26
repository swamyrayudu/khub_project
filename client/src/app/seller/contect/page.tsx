'use client';

import React, { useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { createContactMessage } from '../../../actions/contact-actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare } from "lucide-react";
import 'react-toastify/dist/ReactToastify.css';

export default function SellerContact() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const loadingToastId = toast.loading('Sending your message...', {
      position: 'top-right',
    });

    try {
      const result = await createContactMessage(formData);
      toast.dismiss(loadingToastId);

      if (result.success) {
        toast.success(result.message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        formRef.current?.reset();
      } else {
        toast.error(result.error, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error fetching contacts:', errorMessage, error);
      toast.dismiss(loadingToastId);
      toast.error('Something went wrong. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />

      <div className="max-w-md w-full">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Contact Admin
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Send us a message and we'll get back to you soon
            </p>
          </CardHeader>
          
          <CardContent>
            <form ref={formRef} action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="sellerEmail" className="text-sm font-medium text-foreground">
                  Your Email *
                </label>
                <Input
                  type="email"
                  id="sellerEmail"
                  name="sellerEmail"
                  placeholder="your.email@company.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Type your message here..."
                  required
                  rows={5}
                  className="w-full resize-none"
                  minLength={10}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need urgent help? Email us directly at{" "}
            <span className="text-primary font-medium">admin@localhunt.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
