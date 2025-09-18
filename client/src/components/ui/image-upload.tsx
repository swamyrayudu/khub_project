"use client";

import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export default function ImageUpload({ 
  value = [], 
  onChange, 
  disabled = false,
  maxFiles = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<number, string>>({});

  const uploadToCloudinary = async (file: File, index: number): Promise<string> => {
    setUploading(prev => ({ ...prev, [index]: true }));
    setUploadProgress(prev => ({ ...prev, [index]: 'Uploading...' }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadProgress(prev => ({ ...prev, [index]: 'Upload Successful!' }));
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, [index]: 'Upload failed!' }));
      throw error;
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
      }, 3000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesToUpload = Array.from(files).slice(0, maxFiles - value.length);
    
    try {
      const uploadPromises = filesToUpload.map((file, index) => 
        uploadToCloudinary(file, value.length + index)
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      const newUrls = [...value, ...uploadedUrls];
      onChange(newUrls);
      
      console.log("✅ Images uploaded:", uploadedUrls);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemove = (urlToRemove: string) => {
    const newUrls = value.filter(url => url !== urlToRemove);
    onChange(newUrls);
  };

  const canUploadMore = value.length < maxFiles;
  const isAnyUploading = Object.values(uploading).some(Boolean);

  return (
    <div className="space-y-4">
      {/* Upload Input */}
      {canUploadMore && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              multiple
              onChange={handleFileChange}
              disabled={disabled || isAnyUploading}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50 transition-all duration-200"
            />
            {isAnyUploading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Upload className="w-5 h-5 text-primary animate-pulse" />
              </div>
            )}
          </div>

          {/* Progress Display */}
          {Object.entries(uploadProgress).map(([index, progress]) => (
            <div key={index} className={`flex items-center text-xs ${
              progress.includes('Successful') 
                ? 'text-green-600' 
                : progress.includes('failed') 
                ? 'text-destructive' 
                : 'text-primary'
            }`}>
              {progress.includes('Successful') ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : progress.includes('failed') ? (
                <XCircle className="w-4 h-4 mr-1" />
              ) : (
                <Upload className="w-4 h-4 mr-1 animate-pulse" />
              )}
              {progress}
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Upload up to {maxFiles} images (JPG, PNG, GIF, WebP) • Max 10MB each
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div key={url} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  disabled={disabled}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
